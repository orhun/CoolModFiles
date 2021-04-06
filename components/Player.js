import React from "react";

import copy from "copy-to-clipboard";
import { saveAs } from "file-saver";
import styles from "./Player.module.scss";
import PlayerBig from "./PlayerBig";
import PlayerMin from "./PlayerMin";
import BackSide from "./BackSide";
import LikedMods from "./LikedMods";

import { ToastContainer } from "react-toastify";
import { useInterval, useKeyPress } from "../hooks";
import { generateEmbedString, getRandomInt, showToast } from "../utils";

function Player({ sharedTrackId, backSideContent, latestId }) {
  const [isPlay, setIsPlay] = React.useState(false);
  const [player, setPlayer] = React.useState(null);
  const [maxId] = React.useState(latestId);
  const [trackId, setTrackId] = React.useState(
    sharedTrackId ? sharedTrackId : getRandomInt(0, latestId)
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
    [favoriteModsRuntime, setFavoriteModsRuntime] = React.useState(
      JSON.parse(favoriteModsJSON)
    );
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

  React.useEffect(() => {
    if (helpDrawerOpen) {
      setBackClass([backClass[0], styles.slideRight]);
    } else {
      setBackClass([backClass[0], styles.slideLeft]);
    }
  }, [helpDrawerOpen]);

  React.useEffect(() => {
    if (likedModsDrawerOpen) {
      setLikedModsClass([likedModsClass[0], styles.slideRight]);
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

  const downloadTrack = () => {
    window.location.href = `https://api.modarchive.org/downloads.php?moduleid=${trackId}`;
  };

  const changeSize = () => {
    setSize(size === "big" ? "small" : "big");
  };

  const updateFavoriteModsRuntime = (newFavoriteModsArray) => {
    setFavoriteModsRuntime(newFavoriteModsArray);
    localStorage.setItem("favoriteMods", JSON.stringify(newFavoriteModsArray));
    if (counter >= 10 && counter < 15) {
      showToast("WE'RE HIRING WEB DEVELOPERS");
      setCounter(counter + 1);
    } else if (counter == 15) {
      showToast("CONTACT US");
      setCounter(counter + 1);
    } else if (counter < 10) {
      showToast("added to favorites!");
      setCounter(counter + 1);
    }
  };

  const removeFavoriteModRuntime = (modToRemoveFromRuntimeList) => {
    let newFavoriteModsArray = favoriteModsRuntime.filter(
      (mod) => mod !== modToRemoveFromRuntimeList
    );
    setFavoriteModsRuntime(newFavoriteModsArray);
    localStorage.setItem("favoriteMods", JSON.stringify(newFavoriteModsArray));
  };

  const downloadFavoriteMods = () => {
    var blob = new Blob([favoriteModsRuntime.join("\n")], {
      type: "text/plain;charset=utf-8",
    });
    saveAs(blob, "coolmods.txt");
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
            <h2 onClick={() => downloadFavoriteMods()}>
              <a href="#">Favorite Mods</a>
            </h2>
            <hr className={styles.fancyHr} />
            <div className={styles.likedModsContent}>
              <LikedMods
                content={favoriteModsRuntime}
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
