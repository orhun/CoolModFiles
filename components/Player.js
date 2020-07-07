import React from "react";

import styles from "./Player.module.scss";
import PlayButton from "../icons/PlayIcon";
import PauseButton from "../icons/PauseIcon";
import ArrowIcon from "../icons/ArrowIcon";

function Player() {
  const [isPlay, setIsPlay] = React.useState(false);

  const togglePlay = () => {
    setIsPlay(!isPlay);
  };

  return (
    <div className={styles.player}>
      <img className={styles.banner} src="/images/disc_anim.gif" alt="anim" />
      <h1>Help me!</h1>
      <ul className={styles.metadata}>
        <li>Type: Mod</li>
        <li>Message: I'm pickle Rick</li>
        <li>Date: 01.09.2020</li>
      </ul>

      <input
        className={styles.seekbar}
        type="range"
        name="seekbar"
        id="seekbar"
        min="0"
        max="100"
      />

      {isPlay ? (
        <PlayButton
          className={styles.actionbtn}
          height="130"
          width="130"
          onClick={() => togglePlay()}
        />
      ) : (
        <PauseButton
          className={styles.actionbtn}
          height="130"
          width="130"
          onClick={() => togglePlay()}
        />
      )}
      <ArrowIcon className={styles.arrow} height="20" width="50"/>
    </div>
  );
}

export default Player;
