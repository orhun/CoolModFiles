import React from "react";
import Player from "../components/Player";
import Footer from "../components/Footer";
import {
  getRandomInt,
  getRandomFromArray,
  MESSAGES,
  EE_MESSAGES,
} from "../utils";

function Index() {
  const [start, setStart] = React.useState(false);
  if (start) {
    return (
      <div id="app">
        <Player />
        <Footer />
      </div>
    );
  }

  return (
    <div id="app">
      <div className="randombtn" onClick={() => setStart(true)}>
        <p suppressHydrationWarning>
          {getRandomFromArray(getRandomInt(0, 1000) ? MESSAGES : EE_MESSAGES)}
        </p>
      </div>
    </div>
  );
}

export default Index;
