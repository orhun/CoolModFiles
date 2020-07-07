import React from "react";
import Player from "../components/Player";

function Index() {
  const [start, setStart] = React.useState(false);
  return (
    <div id="app">
      <button onClick={() => setStart(true)}>Aç</button>
      {start && <Player />}
    </div>
  );
}

export default Index;
