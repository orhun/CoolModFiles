import React from "react";
import Slider from "rc-slider";
import moment from "moment";

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
  RepeatIcon,
  LikeButton,
  PlayListButton,
} from "../icons";
import LoadingState from "./LoadingState";
import { getRandomFromArray, showToast, SHARE_MESSAGES } from "../utils";

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
  toggleHelpDrawer,
  toggleLikedModsDrawer,
  downloadTrack,
  repeat,
  setRepeat,
  copyEmbed,
  favoriteModsRuntime,
  updateFavoriteModsRuntime,
}) {
  const [dropDownClass, setDropDownClass] = React.useState(dropDownClose);
  const shareKey = useKeyPress("s");

  React.useEffect(() => {
    if (shareKey)
      setDropDownClass(
        dropDownClass === dropDownClose ? dropDownOpen : dropDownClose
      );
  }, [shareKey]);

  React.useEffect(() => {
    setTimeout(() => {
      try {
        document.getElementById("backside").style.visibility = "visible";
      } catch (error) {}
    }, 1000);
    setTimeout(() => {
      try {
        document.getElementById("liked-mods").style.visibility = "visible";
      } catch (error) {}
    }, 1000);
  }, []);

  React.useEffect(() => {
    document.getElementById("repeat").classList.toggle(styles.deactive);
  }, [repeat]);

  const shareOnTwitter = () => {
    const twUrl = new URL("https://twitter.com/intent/tweet");
    twUrl.searchParams.append(
      "text",
      `${getRandomFromArray(SHARE_MESSAGES)} ${
        process.env.DOMAIN
      }/?trackId=${trackId}`
    );
    window.open(twUrl.href, "_blank").focus();
  };

  const makeTrackIdCool = (id) => {
    return `#${id}`;
  };
  const getTrackIdFromCoolId = (id) => {
    return parseInt(id.replace("#", ""));
  };
  const likeCurrentTrack = (favoriteModsRuntime, updateFavoriteModsRuntime) => {
    let trackIdInt = parseInt(trackId);
    if (favoriteModsRuntime.length) {
      favoriteModsRuntime = favoriteModsRuntime.filter((coolId) => {
        let id = getTrackIdFromCoolId(coolId);
        return trackIdInt !== id;
      });
      let newFavoriteModsRuntime = [
        ...favoriteModsRuntime,
        makeTrackIdCool(trackIdInt),
      ];
      updateFavoriteModsRuntime(newFavoriteModsRuntime);
    } else {
      updateFavoriteModsRuntime([makeTrackIdCool(trackId)]);
    }
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
          <LikeButton
            className={styles.likeButton}
            height="30"
            width="60"
            onClick={() =>
              likeCurrentTrack(favoriteModsRuntime, updateFavoriteModsRuntime)
            }
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
            <CodeIcon height="30" width="30" onClick={() => copyEmbed()} />
          </div>
        </div>
      </div>
      <h2 className={styles.title}>{title ? title : "[No Title]"}</h2>
      {!loading ? (
        <ul className={styles.metadata}>
          {metaData.artist ? <li>Artist: {metaData.artist}</li> : null}
          {metaData.date ? <li>Date: {metaData.date}</li> : null}
          <li>Type: {metaData.type}</li>
          <li>
            <a
              href={`https://modarchive.org/index.php?request=view_by_moduleid&query=${trackId}`}
              target="_blank"
              className={styles.modlink}
            >
              Track Id: #{trackId}
            </a>
          </li>
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
        <div className={styles.footerLeft}>
          <QuestionIcon
            className={styles.question}
            height="30"
            width="30"
            onClick={() => toggleHelpDrawer()}
          />
        </div>
        <div className={styles.footerCenter}>
          <ArrowIcon
            className={styles.arrow}
            height="20"
            width="50"
            onClick={() => changeSize()}
          />
        </div>

        <div className={styles.footerRight}>
          <PlayListButton
            id="playlistButton"
            className={styles.playlistButton}
            height="30"
            width="30"
            onClick={() => toggleLikedModsDrawer()}
          />
          <RepeatIcon
            id="repeat"
            className={styles.repeat}
            height="30"
            width="30"
            onClick={() => {
              showToast(`repeat ${!repeat ? "on" : "off"}`);
              setRepeat(!repeat);
            }}
          />
        </div>
      </div>
    </React.Fragment>
  );
}

export default PlayerBig;
