import React from 'react';
import AudioPlayer from 'react-h5-audio-player';
import 'react-h5-audio-player/lib/styles.css';

const Summary = ({ recording }) => {
  // NOTE: Necessary because nickname data isn't necessarily the cleanest
  const hasAtLeastOneValidNickname = recording.also.some((nickname) => nickname !== '');

  return (
    <div>
      <div className="bird-summary">
        <div className="bird-attribute-container">
          <small className="bird-attribute-title">Common Name</small>
          <p className="bird-attribute-value">{recording.en}</p>
        </div>
        <div className="bird-attribute-container">
          <small className="bird-attribute-title">Genus</small>
          <p className="bird-attribute-value">{recording.gen}</p>
        </div>
        <div className="bird-attribute-container">
          <small className="bird-attribute-title">Country</small>
          <p className="bird-attribute-value">{recording.cnt}</p>
        </div>
        <div className="bird-attribute-container">
          <small className="bird-attribute-title">Location</small>
          <p className="bird-attribute-value">{recording.loc}</p>
        </div>
        <div className="bird-attribute-container">
          <small className="bird-attribute-title">Recorder</small>
          <p className="bird-attribute-value">{recording.rec}</p>
        </div>
        <div className="bird-attribute-container">
          <small className="bird-attribute-title">Date Recorded</small>
          <p className="bird-attribute-value">{recording.date}</p>
        </div>
        <div className="bird-attribute-container">
          <small className="bird-attribute-title">Date Uploaded</small>
          <p className="bird-attribute-value">{recording.uploaded}</p>
        </div>
        {hasAtLeastOneValidNickname && (
          <div className="bird-attribute-container">
            <small className="bird-attribute-title">Nicknames:</small>
            <ul className="bird-nickname-list">
              {recording.also.map((nickname) => nickname ? <li key={nickname}>{nickname}</li> : null)}
            </ul>
          </div>
        )}
      </div>
      <AudioPlayer
        src={recording.file}
        showJumpControls={false}
        autoPlayAfterSrcChange={false}
        customAdditionalControls={[]}
      />
    </div>
  );
};

export default Summary;
