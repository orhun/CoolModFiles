import React from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";

import copy from "copy-to-clipboard";
import styles from "./Player.module.scss";
import PlayerBig from "./PlayerBig";
import PlayerMin from "./PlayerMin";
import BackSide from "./BackSide";
import LikedMods from "./LikedMods";

import { ToastContainer } from "react-toastify";
import { useInterval, useKeyPress } from "../hooks";
import { generateEmbedString, getRandomInt, showToast } from "../utils";
import { DownloadButton } from "../icons";
const DEFAULT_VOLUME = 80
function Player({ sharedTrackId, backSideContent, latestId }) {
  const [isPlay, setIsPlay] = React.useState(false);
  const [player, setPlayer] = React.useState(null);
  const [volume, setVolume] = React.useState(() => {
    const rememberedVolume = parseInt(localStorage.getItem("volume"));
    if(rememberedVolume > -1) return rememberedVolume
    return DEFAULT_VOLUME;
  });
  const [maxId] = React.useState(latestId);
  const [trackId, setTrackId] = React.useState(
    sharedTrackId || getRandomInt(0, latestId)
  );
  const [metaData, setMetaData] = React.useState({});
  const [loading, setLoading] = React.useState(true);
  const [title, setTitle] = React.useState("Loading...");
  const [progress, setProgress] = React.useState(0);
  const [max, setMax] = React.useState(0);
  const [size, setSize] = React.useState("big");
  const [prevIds, setPrevIds] = React.useState([]);
  const [currentId, setCurrentId] = React.useState(-1);
  const [repeat, setRepeat] = React.useState(false);
  const [helpDrawerOpen, setHelpDrawerOpen] = React.useState(false);
  const [likedModsDrawerOpen, setLikedModsDrawerOpen] = React.useState(false);
  const [backClass, setBackClass] = React.useState([styles.playerBack]);
  const [likedModsClass, setLikedModsClass] = React.useState([
    styles.playerBack,
  ]);

  let favoriteModsRuntime, setFavoriteModsRuntime;
  let favoriteModsJSON = localStorage.getItem("favoriteMods");
  if (favoriteModsJSON === null || !favoriteModsJSON) {
    [favoriteModsRuntime, setFavoriteModsRuntime] = React.useState([]);
  } else {
    let initFavMods = JSON.parse(favoriteModsJSON);
    if (
      initFavMods.length &&
      (typeof initFavMods[0] === "string" || initFavMods[0] instanceof String)
    ) {
      initFavMods = initFavMods.map((oldTrackId) => {
        return {
          id: parseInt(oldTrackId.replace("#", "")),
        };
      });
    }
    [favoriteModsRuntime, setFavoriteModsRuntime] = React.useState(initFavMods);
  }
  const [counter, setCounter] = React.useState(0);

  const [spaceKey, enterKey] = [useKeyPress(" "), useKeyPress("Enter")];
  const shiftKey = useKeyPress("Shift");
  const [helpKey, quitKey] = [useKeyPress("/"), useKeyPress("q")];
  const repeatKey = useKeyPress("1");
  const downloadKey = useKeyPress("d");
  const embedKey = useKeyPress("e");
  const [upKey, nextKey, nextKeyVim] = [
    useKeyPress("ArrowUp"),
    useKeyPress("n"),
    useKeyPress("k"),
  ];
  const [downKey, backKey, backKeyVim] = [
    useKeyPress("ArrowDown"),
    useKeyPress("p"),
    useKeyPress("j"),
  ];
  const [rightKey, rightKeyVim] = [useKeyPress("ArrowRight"), useKeyPress("l")];
  const [leftKey, leftKeyVim] = [useKeyPress("ArrowLeft"), useKeyPress("h")];

  React.useEffect(() => {
    if (spaceKey || enterKey) togglePlay();
    if (shiftKey) changeSize();
    if (helpKey || quitKey) toggleHelpDrawer();
    if (repeatKey) {
      showToast(`repeat ${!repeat ? "on" : "off"}`);
      player.setRepeatCount(!repeat ? -1 : 0)
      setRepeat(!repeat);
    }
    if (downloadKey) downloadTrack();
    if (embedKey) copyEmbed();
    if (upKey || nextKey || nextKeyVim) playNext();
    if (downKey || backKey || backKeyVim) playPrevious();
    if ((rightKey || rightKeyVim) && isPlay)
      player.seek(player.getPosition() + 5);
    if ((leftKey || leftKeyVim) && isPlay)
      player.seek(player.getPosition() - 5);
  }, [
    spaceKey,
    enterKey,
    shiftKey,
    helpKey,
    quitKey,
    repeatKey,
    downloadKey,
    embedKey,
    upKey,
    nextKey,
    nextKeyVim,
    downKey,
    backKey,
    backKeyVim,
    rightKey,
    rightKeyVim,
    leftKey,
    leftKeyVim,
  ]);

  useInterval(
    () => {
      setProgress(player.getPosition() % player.duration());
      if (player.getPosition() === 0 && player.duration() === 0) {
        setIsPlay(false);
        if (repeat) {
          playMusic(trackId);
        } else {
          playNext();
        }
      }
    },
    isPlay ? 500 : null
  );

  React.useEffect(() => {
    setPlayer(new ChiptuneJsPlayer(new ChiptuneJsConfig(repeat ? -1 : 0, volume)));
  }, []);

  React.useEffect(() => {
    localStorage.setItem("volume", volume.toString());
  }, [volume]);

  React.useEffect(() => {
    if (player) {
      playMusic(trackId);
    }
  }, [player]);

  React.useEffect(() => {
    if (helpDrawerOpen) {
      setBackClass([backClass[0], styles.slideRight]);
      if (likedModsDrawerOpen) {
        setLikedModsDrawerOpen(false);
      }
    } else {
      setBackClass([backClass[0], styles.slideLeft]);
    }
  }, [helpDrawerOpen]);

  React.useEffect(() => {
    if (likedModsDrawerOpen) {
      setLikedModsClass([likedModsClass[0], styles.slideRight]);
      if (helpDrawerOpen) {
        setHelpDrawerOpen(false);
      }
    } else {
      setLikedModsClass([likedModsClass[0], styles.slideLeft]);
    }
  }, [likedModsDrawerOpen]);

  const togglePlay = () => {
    setIsPlay(!isPlay);
    player.togglePause();
  };

  const copyEmbed = () => {
    copy(generateEmbedString(trackId, title));
    showToast("copied to clipboard!");
  };

  const playNext = () => {
    if (currentId < prevIds.length - 1) {
      let cid = currentId + 1;
      setTrackId(prevIds[cid]);
      playMusic(prevIds[cid]);
      setCurrentId(cid);
    } else {
      const newId = getRandomInt(0, maxId);
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
        window.history.pushState({ trackId: trackId }, "", `?trackId=${id}`);
        if (!prevIds.includes(id)) {
          let cid = currentId + 1;
          setCurrentId(cid);
          setPrevIds([...prevIds, id]);
        }
        document.title = `🎶 ${player.metadata().title} - CoolModFiles.com 🎶`;
      })
      .catch(() => {
        const newId = getRandomInt(0, maxId);
        setTrackId(newId);
        playMusic(newId);
      });
  };

  const toggleHelpDrawer = () => {
    setHelpDrawerOpen(!helpDrawerOpen);
  };
  const toggleLikedModsDrawer = () => {
    setLikedModsDrawerOpen(!likedModsDrawerOpen);
  };

  const downloadTrack = async () => {
    try {
      const res = await fetch(
        `https://api.modarchive.org/downloads.php?moduleid=${trackId}`
      );
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${metaData.title}.mod`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.log(error);
    }
  };

  const changeSize = () => {
    setSize(size === "big" ? "small" : "big");
  };

  const updateFavoriteModsRuntime = (newFavoriteModsArray) => {
    setFavoriteModsRuntime(newFavoriteModsArray);
    localStorage.setItem("favoriteMods", JSON.stringify(newFavoriteModsArray));
    if (counter >= 10 && counter < 15) {
      showToast("WE'RE HIRING WEB DEVELOPERS");
    } else if (counter == 15) {
      showToast("CONTACT US");
    } else if (counter < 10 || counter > 15) {
      showToast("added to favorites!");
    }
    setCounter(counter + 1);
  };

  const removeFavoriteModRuntime = (modToRemoveFromRuntimeList) => {
    let newFavoriteModsArray = favoriteModsRuntime.filter(
      (mod) => mod.id !== modToRemoveFromRuntimeList
    );
    setFavoriteModsRuntime(newFavoriteModsArray);
    localStorage.setItem("favoriteMods", JSON.stringify(newFavoriteModsArray));
  };

  const downloadFavoriteMods = async () => {
    if (favoriteModsRuntime.length === 0) return;
    showToast("Preparing...");
    const zip = new JSZip();
    const mods = zip.folder("mods");
    for (let mod of favoriteModsRuntime) {
      const res = await fetch(
        `https://api.modarchive.org/downloads.php?moduleid=${mod.id}`
        );
      const blob = await res.blob();
      await mods.file(`${mod.title || mod.id}.mod`, blob, { binary: true });
    }
    const zipContent = await zip.generateAsync({ type: "blob" });
    const url = window.URL.createObjectURL(zipContent);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "FavoriteMods.zip");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadFavoriteModsJson = () => {
    const jsonContent = favoriteModsRuntime.map((mod) => ({
      ...mod,
      downloadUrl: `https://api.modarchive.org/downloads.php?moduleid=${mod.id}`,
    }));
    let blob = new Blob([JSON.stringify(jsonContent, null, 2)], {
      type: "application/json;charset=utf-8",
    });
    saveAs(blob, "coolmods.json");
  };

  return (
    <div>
      <ToastContainer />
      {size === "big" ? (
        <div className={styles.playerWrapper}>
          <div className={styles.player}>
            <PlayerBig
              title={title}
              loading={loading}
              metaData={metaData}
              trackId={trackId}
              setTrackId={setTrackId}
              progress={progress}
              max={max}
              player={player}
              volume={volume}
              setVolume={setVolume}
              isPlay={isPlay}
              togglePlay={togglePlay}
              setProgress={setProgress}
              changeSize={changeSize}
              playPrevious={playPrevious}
              playNext={playNext}
              currentId={currentId}
              toggleLikedModsDrawer={toggleLikedModsDrawer}
              toggleHelpDrawer={toggleHelpDrawer}
              downloadTrack={downloadTrack}
              repeat={repeat}
              setRepeat={setRepeat}
              copyEmbed={copyEmbed}
              updateFavoriteModsRuntime={updateFavoriteModsRuntime}
              favoriteModsRuntime={favoriteModsRuntime}
            />
          </div>
          <div id="backside" className={backClass.join(" ")}>
            <h2>Help</h2>
            <hr className={styles.fancyHr} />
            <div className={styles.backSideContent}>
              <BackSide content={backSideContent} />
            </div>
          </div>
          <div id="liked-mods" className={likedModsClass.join(" ")}>
            <header className={styles.favoriteHeader}>
              <h2 onClick={downloadFavoriteModsJson}>
                <a href="#">Favorite Mods</a>
              </h2>
              <div className={styles.downloadAll}>
              <DownloadButton
                  onClick={downloadFavoriteMods}
                  height="25"
                  width="25"
                />
              </div>
            </header>
            <hr className={styles.fancyHr} />
            <div className={styles.likedModsContent}>
              <LikedMods
                content={favoriteModsRuntime}
                setTrackId={setTrackId}
                playMusic={playMusic}
                removeFavoriteModRuntime={removeFavoriteModRuntime}
              />
            </div>
          </div>
        </div>
      ) : (
        <div className={styles.player}>
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
            downloadTrack={downloadTrack}
          />
        </div>
      )}
    </div>
  );
}

export default Player;
