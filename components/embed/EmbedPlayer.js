import React from "react";
import Slider from "rc-slider";
import moment from "moment";

import { useInterval } from "../../hooks";
import styles from "./EmbedPlayer.module.scss";
import { DownloadButton, PauseButton, PlayButton } from "../../icons";
import { getRandomInt, RANDOM_MAX } from "../../utils";

function EmbedPlayer({ sharedTrackId, sharedTitle }) {
  const [isPlay, setIsPlay] = React.useState(false);
  const [start, setStart] = React.useState(false);
  const [player, setPlayer] = React.useState(null);
  const [trackId, setTrackId] = React.useState(42);
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState(sharedTitle);
  const [progress, setProgress] = React.useState(0);
  const [max, setMax] = React.useState(100);

  useInterval(
    () => {
      setProgress(player.getPosition());
      if (player.getPosition() === 0 && player.duration() === 0) {
        setIsPlay(false);
        playMusic(sharedTrackId);
      }
    },
    isPlay ? 500 : null
  );
  React.useEffect(() => {
    setTitle(sharedTitle);
  }, sharedTitle);
  React.useEffect(() => {
    if (player && sharedTrackId) playMusic(sharedTrackId);
  }, [player]);

  const initPlayer = () => {
    setPlayer(new ChiptuneJsPlayer(new ChiptuneJsConfig(0)));
  };

  const playMusic = (id) => {
    setTitle("Loading");
    player
      .load(`jsplayer.php?moduleid=${id}`)
      .then((buffer) => {
        player.play(buffer);
        setTrackId(id);
        setTitle(player.metadata().title);
        setMax(player.duration());
        setIsPlay(true);
        player.seek(0);
        document.title = `🎶 ${player.metadata().title} - CoolModFiles`;
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

  const togglePlay = () => {
    setIsPlay(!isPlay);
    player.togglePause();
  };

  return (
    <div className={styles.player}>
      <div className={styles.header}>
        <img
          className={styles.banner}
          src={`/images/disc_${isPlay ? "anim" : "idle"}.gif`}
          alt="anim"
        />
        <div className={styles.titleWrap}>
          <h3>{title ? title : "[No Title]"}</h3>
          <ul className={styles.metadata}>
            <li>Track Id: #{trackId}</li>
          </ul>
        </div>
        <DownloadButton
          className={styles.downloadButton}
          height="20"
          width="50"
          onClick={() => {
            window.location.href = `https://api.modarchive.org/downloads.php?moduleid=${trackId}`;
          }}
        />
      </div>
      <div className={styles.seekbarWrapper}>
        <div style={{ flex: 1 }}>
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
            <span>
              {moment().startOf("day").seconds(progress).format("mm:ss")}
            </span>
            <span>{moment().startOf("day").seconds(max).format("mm:ss")}</span>
          </div>
        </div>
        {!isPlay ? (
          <PlayButton
            className={styles.actionbtn}
            height="50"
            width="50"
            onClick={() => {
              if (!start) {
                initPlayer();
                setStart(true);
              } else {
                togglePlay();
              }
            }}
          />
        ) : (
          <PauseButton
            className={styles.actionbtn}
            height="50"
            width="50"
            onClick={!loading ? () => togglePlay() : null}
          />
        )}
      </div>
    </div>
  );
}
export default EmbedPlayer;
