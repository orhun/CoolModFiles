import React from "react";

import styles from "./Player.module.scss";
import PlayerBig from "./PlayerBig";
import PlayerMin from "./PlayerMin";

import { useInterval } from "../hooks";
import { getRandomInt, RANDOM_MAX } from "../utils";

function Player({ sharedTrackId }) {
  const [isPlay, setIsPlay] = React.useState(false);
  const [player, setPlayer] = React.useState(null);
  const [trackId, setTrackId] = React.useState(
    sharedTrackId ? sharedTrackId : getRandomInt(0, RANDOM_MAX)
  );
  const [metaData, setMetaData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState("Loading...");
  const [progress, setProgress] = React.useState(0);
  const [max, setMax] = React.useState(100);
  const [size, setSize] = React.useState("big");
  const [prevIds, setPrevIds] = React.useState([]);
  const [currentId, setCurrentId] = React.useState(-1);
  const [repeat, setRepeat] = React.useState(false);

  useInterval(
    () => {
      setProgress(player.getPosition());
      if (player.getPosition() === 0 && player.duration() === 0) {
        setIsPlay(false);
        if (repeat) {
          playMusic(prevIds[currentId]);
        } else {
          playNext();
        }
      }
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

  const togglePlay = () => {
    setIsPlay(!isPlay);
    player.togglePause();
  };

  const playNext = () => {
    if (currentId < prevIds.length) {
      let cid = currentId + 1;
      setTrackId(prevIds[cid]);
      playMusic(prevIds[cid]);
      setCurrentId(cid);
    } else {
      const newId = getRandomInt(0, RANDOM_MAX);
      setTrackId(newId);
      playMusic(newId);
    }
  };

  const playPrevious = () => {
    if (currentId != 0) {
      let cid = currentId - 1;
      setTrackId(prevIds[cid]);
      playMusic(prevIds[cid]);
      setCurrentId(cid);
    }
  };

  const playMusic = (id) => {
    setLoading(true);
    setIsPlay(false);
    setTitle("Loading...");
    player.pause();
    player
      .load(`jsplayer.php?moduleid=${id}`)
      .then((buffer) => {
        setLoading(false);
        player.play(buffer);
        setMetaData(player.metadata());
        setTitle(player.metadata().title);
        setMax(player.duration());
        setIsPlay(true);
        player.seek(0);
        window.history.pushState({trackId: trackId}, "", `?trackId=${id}`);
        if (!prevIds.includes(id)) {
          let cid = currentId + 1;
          setCurrentId(cid);
          setPrevIds([...prevIds, id]);
        }
        document.title = `🎶 ${player.metadata().title} - CoolModFiles.com 🎶`;
      })
      .catch(() => {
        const newId = getRandomInt(0, RANDOM_MAX);
        setTrackId(newId);
        playMusic(newId);
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
          setTrackId={setTrackId}
          progress={progress}
          max={max}
          player={player}
          isPlay={isPlay}
          togglePlay={togglePlay}
          setProgress={setProgress}
          changeSize={changeSize}
          playPrevious={playPrevious}
          playNext={playNext}
          currentId={currentId}
        />
      ) : (
        <PlayerMin
          title={title}
          loading={loading}
          trackId={trackId}
          progress={progress}
          max={max}
          isPlay={isPlay}
          player={player}
          togglePlay={togglePlay}
          setProgress={setProgress}
          changeSize={changeSize}
        />
      )}
    </div>
  );
}

export default Player;
