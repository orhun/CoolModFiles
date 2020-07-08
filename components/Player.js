import React from "react";

import styles from "./Player.module.scss";
import PlayerBig from "./PlayerBig";
import PlayerMin from "./PlayerMin";

import { useInterval } from "../hooks";
import { getRandomInt } from "../utils";

const RANDOM_MAX = 189573;

function Player() {
  const [isPlay, setIsPlay] = React.useState(false);
  const [player, setPlayer] = React.useState(null);
  const [trackId, setTrackId] = React.useState(getRandomInt(0, RANDOM_MAX));
  const [metaData, setMetaData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState("Loading");
  const [progress, setProgress] = React.useState(0);
  const [max, setMax] = React.useState(100);
  const [size, setSize] = React.useState("big");

  useInterval(
    () => {
      setProgress(player.getPosition());
    },
    isPlay ? 500 : null
  );

  React.useEffect(() => {
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
        document.title = `🎶 ${player.metadata().title} - CoolModFiles`
      })
      .catch((err) => {
        // if any error reload track id and replay
        console.log("restaring player");
        const newId = getRandomInt(0, RANDOM_MAX);
        setTrackId(newId);
        playMusic(newId);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const changeSize = () => {
    setSize(size === "big" ? "small" : "big");
  };

  return (
    <div className={styles.player}>
      {size === "big" ? (
        <PlayerBig
          title={title}
          loading={loading}
          metaData={metaData}
          trackId={trackId}
          progress={progress}
          max={max}
          isPlay={isPlay}
          player={player}
          setIsPlay={setIsPlay}
          setProgress={setProgress}
          changeSize={changeSize}
        />
      ) : (
        <PlayerMin
          title={title}
          loading={loading}
          metaData={metaData}
          trackId={trackId}
          progress={progress}
          max={max}
          isPlay={isPlay}
          player={player}
          setIsPlay={setIsPlay}
          setProgress={setProgress}
          changeSize={changeSize}
        />
      )}
    </div>
  );
}

export default Player;
