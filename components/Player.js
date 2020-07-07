import React from "react";
import Slider from "rc-slider";
import moment from "moment";

import styles from "./Player.module.scss";
import PlayButton from "../icons/PlayIcon";
import PauseButton from "../icons/PauseIcon";
import ArrowIcon from "../icons/ArrowIcon";

import { useInterval } from "../hooks";

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
  const [progress, setProgress] = React.useState(0);
  const [max, setMax] = React.useState(100);

  useInterval(
    () => {
      setProgress(player.getPosition());
    },
    isPlay ? 500 : null
  );

  React.useEffect(() => {
    console.log("asds");
    setPlayer(new ChiptuneJsPlayer(new ChiptuneJsConfig(0)));
  }, []);

  React.useEffect(() => {
    if (player) {
      playMusic(trackId);
    }
  }, [player]);

  const playMusic = (id) => {
    player
      .load(`jsplayer.php?moduleid=${id}`)
      .then((buffer) => {
        player.play(buffer);
        setMetaData(player.metadata());
        setTitle(player.metadata().title);
        setMax(player.duration());
        setIsPlay(true);
      })
      .catch((err) => {
        // if any error reload track id and replay
        const newId = getRandomInt(0, RANDOM_MAX);
        setTrackId(newId);
        playMusic(newId);
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
      <h1>{title ? title : "[No Title]"}</h1>
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
        value={progress}
        max={max}
        onChange={(val) => {
          setProgress(val);
          player.seek(val);
        }}
      />
      <div className={styles.seekNumbers}>
        <span>{moment().startOf("day").seconds(progress).format("mm:ss")}</span>
        <span>{moment().startOf("day").seconds(max).format("mm:ss")}</span>
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
