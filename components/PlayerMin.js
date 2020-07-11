import React from "react";
import Slider from "rc-slider";
import moment from "moment";

import styles from "./PlayerMin.module.scss";
import {
  ArrowIcon,
  DownloadButton,
  PauseButton,
  PlayButton,
} from "../icons";


function PlayerMin({
  title,
  loading,
  trackId,
  progress,
  max,
  isPlay,
  player,
  togglePlay,
  setProgress,
  changeSize
}) {
  return (
    <React.Fragment>
      <div className={styles.header}>
      <img
        className={styles.banner}
        src={`/images/disc_${isPlay ? "anim" : "idle"}.gif`}
        alt="anim" />
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
            onClick={!loading ? () => togglePlay() : null}
          />
        ) : (
          <PauseButton
            className={styles.actionbtn}
            height="50"
            width="50"
            onClick={() => togglePlay()}
          />
        )}
      </div>
      <ArrowIcon
        className={styles.arrow}
        height="20"
        width="50"
        onClick={() => changeSize()}
      />
    </React.Fragment>
  );
}

export default PlayerMin;
