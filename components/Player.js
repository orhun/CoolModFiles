import React from "react";

import styles from "./Player.module.scss";
import PlayerBig from "./PlayerBig";
import PlayerMin from "./PlayerMin";

import { useInterval, useKeyPress } from "../hooks";
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
  const [max, setMax] = React.useState(0);
  const [size, setSize] = React.useState("big");
  const [prevIds, setPrevIds] = React.useState([]);
  const [currentId, setCurrentId] = React.useState(-1);
  const [repeat, setRepeat] = React.useState(false);
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [backClass, setBackClass] = React.useState([styles.playerBack]);

  const [spaceKey, enterKey] = [useKeyPress(" "), useKeyPress("Enter")];
  const [tabKey, shiftKey] = [useKeyPress("Tab"), useKeyPress("Shift")];
  const downloadKey = useKeyPress("d");
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
    if (tabKey || shiftKey) changeSize();
    if (downloadKey) downloadTrack();
    if (upKey || nextKey || nextKeyVim) playNext();
    if (downKey || backKey || backKeyVim) playPrevious();
    if ((rightKey || rightKeyVim) && isPlay)
      player.seek(player.getPosition() + 5);
    if ((leftKey || leftKeyVim) && isPlay)
      player.seek(player.getPosition() - 5);
  }, [
    spaceKey,
    enterKey,
    tabKey,
    shiftKey,
    downloadKey,
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
    if (drawerOpen) {
      setBackClass([backClass[0], styles.slideRight]);
    } else {
      setBackClass([backClass[0], styles.slideLeft]);
    }
  }, [drawerOpen]);

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
        window.history.pushState({ trackId: trackId }, "", `?trackId=${id}`);
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

  const toggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  }

  const downloadTrack = () => {
    window.location.href = `https://api.modarchive.org/downloads.php?moduleid=${trackId}`;
  };

  const changeSize = () => {
    setSize(size === "big" ? "small" : "big");
  };

  return (
    <div>
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
              toggleDrawer={toggleDrawer}
              downloadTrack={downloadTrack}
            />
          </div>
          <div id="backside" className={backClass.join(" ")}>
            <h1>Help</h1>
            <hr className={styles.fancyHr} />
            <div className={styles.backSideContent}>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                Praesent gravida viverra diam at tempus. Sed sit amet convallis
                lectus. Nunc convallis nisl a convallis tincidunt. Nulla sit
                amet libero non dui consequat luctus. Sed pellentesque lobortis
                turpis, sit amet tempor risus ultricies nec. Nulla a molestie
                elit, nec eleifend ligula. Etiam in hendrerit urna. Sed dapibus
                purus eget semper venenatis. Maecenas et enim nulla. Sed gravida
                luctus sem, ut convallis tellus feugiat vel. Morbi et maximus
                diam. Vivamus tristique lacinia sollicitudin. Fusce eleifend
                facilisis sapien, non eleifend ante lacinia ut. Sed efficitur
                eros at sapien eleifend, eu placerat leo finibus. Pellentesque
                habitant morbi tristique senectus et netus et malesuada fames ac
                turpis egestas. Fusce dapibus suscipit mi quis consectetur.
                Integer varius molestie bibendum. Donec gravida tortor et erat
                volutpat aliquam. Nunc vel felis suscipit, lobortis erat at,
                volutpat felis. Fusce metus orci, tempor in turpis in,
                vestibulum ornare metus. Morbi tortor libero, mattis vitae
                aliquet at, aliquam id lectus. Pellentesque mi tellus, congue
                vel commodo et, laoreet eget massa. Etiam iaculis efficitur
                magna quis lacinia. Interdum et malesuada fames ac ante ipsum
                primis in faucibus. Pellentesque vitae quam vitae massa ornare
                posuere. Curabitur congue ipsum sed elit facilisis lacinia.
                Nullam malesuada feugiat nulla in viverra. Etiam vitae eros
              </p>
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
