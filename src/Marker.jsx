import React, { useState } from 'react';
import { BIRD_EMOJIS } from './constants';

const birdEmojiIndex = Math.ceil(Math.random() * BIRD_EMOJIS.length) - 1;

const Marker = ({ recording, handleSelectBirdRecording }) => {
  const [isShowing, setIsShowing] = useState(false);
  
  const handleOnClick = () => {
    if (isShowing) {
      setIsShowing(false);
      handleSelectBirdRecording({ recording, closingPopup: true });
      return;
    }

    setIsShowing(true);
    handleSelectBirdRecording({ recording, closingPopup: false });
  };

  return (
    <div className={isShowing ? 'marker selected' : 'marker'} onClick={handleOnClick}>
      <p className="marker-symbol">{BIRD_EMOJIS[birdEmojiIndex]}</p>
      <div className="marker-popup">
        <h4 className="marker-name">{recording.en}</h4>
        <p className="marker-location" title={recording.loc}>{recording.loc}</p>
      </div>
    </div>
  );
};

export default Marker;
