import React from "react";

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function Index() {
  const [player, setPlayer] = React.useState(undefined);
  const [trackId, setTrackId] = React.useState(-1);
  const [meteData, setMetaData] = React.useState({});
  const [duration, setDuration] = React.useState(-1);
  const [prog, setProg] = React.useState(0);

  React.useEffect(() => {
    libopenmpt.onRuntimeInitialize = function () {
      initPlayer();
    };
    libopenmpt.onRuntimeInitialize();
  }, []);

  const initPlayer = function () {
    setPlayer(new ChiptuneJsPlayer(new ChiptuneJsConfig(-1)));
  };

  const playRandom = function () {
    const r = getRandomInt(0, 189573);
    player.load(`jsplayer.php?moduleid=${r}`, (buffer) => {
      player.play(buffer);
      setMetaData(player.metadata());
      setDuration(player.duration())
      setTrackId(r);
    });
  };

  return (
    <div>
      <h1>Mod music player</h1>
      <button onClick={playRandom}>Play Random</button>
      <button onClick={() => player.stop()}>stop</button>
      <input type="range" min="0" max={duration} value={prog} onChange={(e) => {{
        setDuration(e.target.value);
        player.seek(e.target.value)
      }}}/>
      <p>{JSON.stringify(meteData)}</p>
    </div>
  );
}

export default Index;
