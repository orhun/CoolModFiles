import React from "react";
import Player from "../components/Player";

function Index() {
  const [start, setStart] = React.useState(false);
  if (start) {
    return (
      <div id="app">
          <Player />
      </div>
    );
  }
  return (
    <div id="app">
      <div className="randombtn" onClick={() => setStart(true)}>
        <p>Give me random song!</p>
      </div>
    </div>
  );
}

export default Index;
