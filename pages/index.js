import React from "react";
import Player from "../components/Player";
import Footer from "../components/Footer";
import {
  getRandomInt,
  getRandomFromArray,
  MESSAGES,
  EE_MESSAGES,
  BG_IMAGES,
} from "../utils";
import { useKeyPress } from "../hooks";

function Index({ trackId }) {
  const [start, setStart] = React.useState(false);
  const [randomMsg, setRandomMsg] = React.useState(
    getRandomFromArray(getRandomInt(0, 1000) ? MESSAGES : EE_MESSAGES)
  );

  const enterKey = useKeyPress("Enter");

  React.useEffect(() => {
    if (enterKey) setStart(true);
  }, [enterKey]);

  React.useEffect(() => {
    document.getElementById(
      "app"
    ).style.backgroundImage = `url('/images/${getRandomFromArray(BG_IMAGES)}')`;
  }, []);
  if (start) {
    return (
      <div id="app">
        <Player sharedTrackId={trackId} />
        <Footer />
      </div>
    );
  }
  return (
    <div id="app">
      <div className="randombtn" onClick={() => setStart(true)}>
        <p suppressHydrationWarning>{randomMsg}</p>
      </div>
    </div>
  );
}

Index.getInitialProps = async ({ query }) => {
  return { trackId: query.trackId };
};

export default Index;
