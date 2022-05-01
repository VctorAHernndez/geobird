import React, { useEffect, useState } from 'react';

import GoogleMapReact from 'google-map-react';

import Marker from './Marker';
import Summary from './Summary';

import { DEFAULT_SETTINGS } from './constants';
import { fetchBirds } from './services';

import bird from './bird.png';

import './App.css';

const InformationColumn = ({ currentBirdRecording, isFetching, metaData, fetchingError }) => {
  // If we're currently fetching the recordings,
  // display a loading screen.
  if (isFetching) {
    return (
      <div className="fetch-loading">
        <img src={bird} alt="bird" />
        <p>Loading...</p>
      </div>
    );
  }

  // If an error occurred while fetching the recordings,
  // we should let the user know.
  if (fetchingError) {
    return (
      <div className="fetching-error">
        <p>An unexpected error occurred 😔</p>
        <div>
          <code>{`Error: ${fetchingError.message}`}</code>
        </div>
        <p>Please contact the developer! 🙏</p>
      </div>
    );
  }

  // If user has already selected a recording, display it.
  if (currentBirdRecording) {
    return <Summary recording={currentBirdRecording}/>;
  }

  // If we've already fetched the recordings,
  // but the user still hasn't selected one,
  // we should prompt the user to select one.
  if (metaData) {
    const numberOfResults = Math.ceil(metaData.numRecordings / metaData.numPages);
    const metaDataDescription = `We've found ${numberOfResults} recordings from around ${metaData.numSpecies} species!`;

    return (
      <div className="metadata-description">
        <p>{metaDataDescription}</p>
        <p>Select a bird to listen to a recording!</p>
      </div>
    );
  }

  // NOTE: We only get to this case if the user still hasn't answered the Geolocation prompt
  return <p>Please answer the prompt...</p>;
};

const App = () => {
  const [center, setCenter] = useState(null);
  const [birdRecordings, setBirdRecordings] = useState([]);
  const [currentBirdRecording, setCurrentBirdRecording] = useState(null);
  const [openBirdRecordings, setOpenBirdRecordings] = useState([]);
  const [userHasGoneThroughGeolocationPrompt, setUserHasGoneThroughGeolocationPrompt] = useState(false);
  const [metaData, setMetaData] = useState(null);
  const [isFetching, setIsFetching] = useState(false);
  const [fetchingError, setFetchingError] = useState(null);

  const handleSelectBirdRecording = ({ recording: clickedRecording, closingPopup }) => {
    if (closingPopup) {
      // Clear the selected recording,
      // only if we're closing the last popup.
      if (openBirdRecordings.length === 1) {
        setCurrentBirdRecording(null);
        setOpenBirdRecordings([]);
        return;
      }

      // Create new array without the closed popup's recording
      const remainingBirdRecordings = openBirdRecordings.filter((e) => e.id !== clickedRecording.id);

      // If there's only one open recording left,
      // focus on it and select it as the currentBirdRecording.
      if (remainingBirdRecordings.length === 1) {
        const lastOpenBirdRecording = remainingBirdRecordings[0];
        setCenter({
          lat: Number(lastOpenBirdRecording.lat),
          lng: Number(lastOpenBirdRecording.lng),
        });
        setCurrentBirdRecording(lastOpenBirdRecording);
      }

      setOpenBirdRecordings(remainingBirdRecordings);
      return;
    }

    setCenter({
      lat: Number(clickedRecording.lat),
      lng: Number(clickedRecording.lng),
    });
    setCurrentBirdRecording(clickedRecording);
    setOpenBirdRecordings([...openBirdRecordings, clickedRecording]);
  }

  // TODO: probably fetch from user's location!
  // TODO: try to fetch recordings from other places (i.e. countries, continents, etc.)
  // Fetch recordings
  useEffect(() => {
    const fetch = async () => {
      setIsFetching(true);

      try {
        const { data } = await fetchBirds();
        setMetaData(data);
        setBirdRecordings(data.recordings);

        // Focus the map on the first we obtained from the API
        const randomIndex = Math.ceil(Math.random() * data.recordings.length) - 1;
        const focusedRecording = data.recordings[randomIndex];
        setCenter({
          lat: Number(focusedRecording.lat),
          lng: Number(focusedRecording.lng),
        });
      } catch (error) {
        setFetchingError(error);
      }

      setIsFetching(false);
    };

    // Only fetch recordings once the user has given us their location (or not)
    if (userHasGoneThroughGeolocationPrompt) {
      fetch();
    }
  }, [userHasGoneThroughGeolocationPrompt]);

  // Set the map's center to the user's location
  useEffect(() => {
    // Exit early it browser doesn't support Geolocation
    if (!navigator.geolocation) {
      console.warn('Browser does not support Geolocation! Defaulting to St. Petersburg.');
      setUserHasGoneThroughGeolocationPrompt(true);
      return;
    }

    // Try fetching user's HTML5 Geolocation
    navigator.geolocation.getCurrentPosition(

      // Success Callback
      (position) => {
        setCenter({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setUserHasGoneThroughGeolocationPrompt(true);
      },

      // Failure Callback
      (error) => {
        console.error('An error occurred while trying to use Geolocation! Error: ', error);
        setCenter(DEFAULT_SETTINGS.center);
        setUserHasGoneThroughGeolocationPrompt(true);
      }
    );
  }, []);

  return (
    <div className="app">
      <div className="map-container">
        {/* If user still hasn't allowed us to check their location, */}
        {/* render a loading screen instead. */}
        {!userHasGoneThroughGeolocationPrompt ? (
          <div className="map-placeholder">
            <h1>Please answer the browser's prompt</h1>
          </div>
        ) : (
          <GoogleMapReact
            center={center || DEFAULT_SETTINGS.center}
            defaultCenter={DEFAULT_SETTINGS.center}
            defaultZoom={DEFAULT_SETTINGS.zoom}
            bootstrapURLKeys={{ key: process.env.REACT_APP_GOOGLE_MAP_API_KEY }}
          >
            {birdRecordings.map((recording) =>
              <Marker
                key={recording.id}
                recording={recording}
                handleSelectBirdRecording={handleSelectBirdRecording}

                // Necessary props for GoogleMapReact
                lat={recording.lat}
                lng={recording.lng}
              />
            )}
          </GoogleMapReact>
        )}
      </div>
      <div className="description-column">
        <h2>GeoBird 🦢</h2>
        <hr />
        <InformationColumn
          isFetching={isFetching}
          currentBirdRecording={currentBirdRecording}
          metaData={metaData}
          fetchingError={fetchingError}
        />
      </div>
    </div>
  );
};

export default App;
