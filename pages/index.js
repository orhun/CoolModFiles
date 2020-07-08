import React from "react";
import Player from "../components/Player";
import {getRandomFromArray, MESSAGES} from "../utils";

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
      <p>{getRandomFromArray(MESSAGES)}</p>
      </div>
    </div>
  );
}

export default Index;
