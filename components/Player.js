import React from "react";
import Slider from "rc-slider";

import styles from "./Player.module.scss";
import PlayButton from "../icons/PlayIcon";
import PauseButton from "../icons/PauseIcon";
import ArrowIcon from "../icons/ArrowIcon";

const RANDOM_MAX = 189573;

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function LoadingState() {
  return (
    <ul className={styles.metadata}>
      <li>███████</li>
      <li>██████████████</li>
      <li>█████████████████</li>
    </ul>
  );
}

function Player() {
  const [isPlay, setIsPlay] = React.useState(false);
  const [player, setPlayer] = React.useState(null);
  const [trackId, setTrackId] = React.useState(getRandomInt(0, RANDOM_MAX));
  const [metaData, setMetaData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState("Loading");

  React.useEffect(() => {
    setPlayer(new ChiptuneJsPlayer(new ChiptuneJsConfig(0)));
  }, []);

  React.useEffect(() => {
    if (player) {
      playMusic();
    }
  }, [player]);

  const playMusic = () => {
    player
      .load(`jsplayer.php?moduleid=${trackId}`)
      .then((buffer) => {
        player.play(buffer);
        setMetaData(player.metadata());
        setTitle(player.metadata().title);
      })
      .catch((err) => {
        // if any error reload track id and replay
        setTrackId(getRandomInt(0, RANDOM_MAX));
        playMusic();
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const togglePlay = () => {
    setIsPlay(!isPlay);
    player.togglePause();
  };

  return (
    <div className={styles.player}>
      <img className={styles.banner} src="/images/disc_anim.gif" alt="anim" />
      <h1>{title}</h1>
      {!loading ? (
        <ul className={styles.metadata}>
          <li>Type: {metaData.type}</li>
          <li>Track Id: #{trackId}</li>
          <li>Message: {metaData.message}</li>
        </ul>
      ) : (
        <LoadingState />
      )}
      <Slider
        railStyle={{ backgroundColor: "white", height: 6 }}
        trackStyle={{ backgroundColor: "#bd00ff", height: 6 }}
        handleStyle={{
          borderColor: "#bd00ff",
          backgroundColor: "#bd00ff",
        }}
        className={styles.seekbar}
      />
      <div className={styles.seekNumbers}>
        <span>00.00</span>
        <span>04.21</span>
      </div>
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
      <ArrowIcon className={styles.arrow} height="20" width="50" />
    </div>
  );
}

export default Player;
