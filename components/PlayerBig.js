import React from "react";
import Slider from "rc-slider";
import moment from "moment";
import copy from "copy-to-clipboard";

import styles from "./PlayerBig.module.scss";
import {
  ArrowIcon,
  DownloadButton,
  LeftButton,
  RightButton,
  PauseButton,
  PlayButton,
  ShareIcon,
  CodeIcon,
  QuestionIcon,
  TwitterOutlineIcon,
} from "../icons";
import LoadingState from "./LoadingState";
import {
  generateEmbedString,
  getRandomFromArray,
  SHARE_MESSAGES,
} from "../utils";

import { useKeyPress } from "../hooks";

const dropDownOpen = [styles.dropdownContent, styles.dropdownOpen].join(" ");
const dropDownClose = styles.dropdownContent;

function PlayerBig({
  title,
  loading,
  metaData,
  trackId,
  progress,
  max,
  player,
  isPlay,
  togglePlay,
  setProgress,
  changeSize,
  playPrevious,
  playNext,
  currentId,
  toggleDrawer,
  downloadTrack,
}) {
  const [dropDownClass, setDropDownClass] = React.useState(dropDownClose);
  const [shareKey, twitterKey, embedKey] = [
    useKeyPress("s"),
    useKeyPress("t"),
    useKeyPress("e"),
  ];

  React.useEffect(() => {
    if (shareKey)
      setDropDownClass(
        dropDownClass === dropDownClose ? dropDownOpen : dropDownClose
      );
    if (twitterKey) shareOnTwitter();
    if (embedKey) copy(generateEmbedString(trackId, title));
  }, [shareKey, twitterKey, embedKey]);

  React.useEffect(() => {
    setTimeout(() => {
      try {
        document.getElementById("backside").style.visibility = "visible";
      } catch (error) {}
    }, 1000);
  });

  const shareOnTwitter = () => {
    const twUrl = new URL("https://twitter.com/intent/tweet");
    twUrl.searchParams.append(
      "text",
      `${getRandomFromArray(SHARE_MESSAGES)} ${
        process.env.DOMAIN
      }/trackId=${trackId}`
    );
    window.open(twUrl.href, "_blank").focus();
  };

  return (
    <React.Fragment>
      <div className={styles.wheader}>
        <div className={styles.downloadWrap}>
          <DownloadButton
            height="30"
            width="60"
            onClick={() => downloadTrack()}
          />
        </div>
        <img
          className={styles.banner}
          src={`/images/disc_${isPlay ? "anim" : "idle"}.gif`}
          alt="anim"
        />
        <div className={styles.shareWrap}>
          <ShareIcon
            height="30"
            width="60"
            onClick={() => {
              setDropDownClass(
                dropDownClass === dropDownClose ? dropDownOpen : dropDownClose
              );
            }}
          />
          <div className={dropDownClass}>
            <TwitterOutlineIcon
              height="30"
              width="30"
              onClick={() => shareOnTwitter()}
            />
            <CodeIcon
              height="30"
              width="30"
              onClick={() => {
                copy(generateEmbedString(trackId, title));
              }}
            />
          </div>
        </div>
      </div>
      <h2 className={styles.title}>{title ? title : "[No Title]"}</h2>
      {!loading ? (
        <ul className={styles.metadata}>
          {metaData.artist ? <li>Artist: {metaData.artist}</li> : null}
          {metaData.date ? <li>Date: {metaData.date}</li> : null}
          <li>Type: {metaData.type}</li>
          <li>Track Id: #{trackId}</li>
          {metaData.message ? (
            <li>Message: {metaData.message.replace(/\n{2,}/g, "\n")}</li>
          ) : null}
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
      <div className={styles.actionButtonsWrapper}>
        <LeftButton
          height="70"
          width="70"
          onClick={!loading ? () => playPrevious() : null}
          disable={currentId === 0 || loading ? "true" : "false"}
        />
        {!isPlay ? (
          <PlayButton
            className={styles.actionbtn}
            height="130"
            width="130"
            onClick={!loading ? () => togglePlay() : null}
          />
        ) : (
          <PauseButton
            className={styles.actionbtn}
            height="130"
            width="130"
            onClick={() => togglePlay()}
          />
        )}
        <RightButton
          height="70"
          width="70"
          onClick={!loading ? () => playNext() : null}
          disable={loading ? "true" : "false"}
        />
      </div>
      <div className={styles.footer}>
        <QuestionIcon className={styles.hidden} height="30" width="30" />
        <ArrowIcon
          className={styles.arrow}
          height="20"
          width="50"
          onClick={() => changeSize()}
        />
        <QuestionIcon
          className={styles.question}
          height="30"
          width="30"
          onClick={() => toggleDrawer()}
        />
      </div>
    </React.Fragment>
  );
}

export default PlayerBig;
