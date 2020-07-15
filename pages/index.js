import React from "react";
import Head from "next/head";
import ReactGA from "react-ga";
import fetch from "isomorphic-unfetch";

import Player from "../components/Player";
import Footer from "../components/Footer";
import {
  getRandomInt,
  getRandomFromArray,
  RANDOM_MAX,
  MESSAGES,
  EE_MESSAGES,
  MOBILE_MESSAGES,
  BG_IMAGES,
} from "../utils";
import { useKeyPress } from "../hooks";
import { isMobile } from "react-device-detect";

function Index({ trackId, backSideContent, latestId }) {
  const [start, setStart] = React.useState(false);
  const [randomMsg] = React.useState(
    getRandomFromArray(getRandomInt(0, 1000) ? MESSAGES : EE_MESSAGES)
  );

  const getMessage = () => {
    if (trackId) {
      return `Play the track #${trackId}`;
    } else {
      return isMobile ? getRandomFromArray(MOBILE_MESSAGES) : randomMsg;
    }
  };

  const enterKey = useKeyPress("Enter");

  React.useEffect(() => {
    if (enterKey) setStart(true);
  }, [enterKey]);

  React.useEffect(() => {
    ReactGA.initialize("UA-172416216-1");
    ReactGA.pageview(window.location.pathname + window.location.search);
    document.getElementById(
      "app"
    ).style.backgroundImage = `url('/images/${getRandomFromArray(BG_IMAGES)}')`;
  }, []);

  if (start) {
    return (
      <React.Fragment>
        <Head>
          <title>CoolModFiles.com - Play some cool MOD files!</title>
        </Head>
        <div id="app">
          <Player
            sharedTrackId={trackId}
            backSideContent={backSideContent}
            latestId={latestId}
          />
          <Footer />
        </div>
      </React.Fragment>
    );
  }
  return (
    <React.Fragment>
      <Head>
        <title>CoolModFiles.com - Play some cool MOD files!</title>
      </Head>
      <div id="app">
        <div className="randombtn" onClick={() => setStart(true)}>
          <p suppressHydrationWarning>{getMessage()}</p>
        </div>
      </div>
    </React.Fragment>
  );
}

Index.getInitialProps = async ({ query }) => {
  const gh_req = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
    },
    body: JSON.stringify({
      query: `{
      repository(owner: "orhun", name: "CoolModFiles") {
        content: object(expression: "master:HELP.md") {
          ... on Blob {
            text
          }
        }
      }
    }`,
    }),
  });
  const rss_req = await fetch(
    "https://modarchive.org/rss.php?request=uploads",
    {
      method: "GET",
    }
  );
  const json = await gh_req.json();
  const rss = await rss_req.text();
  let latestId;
  try {
    latestId = rss.split("downloads.php?moduleid=")[1].split("#")[0];
  } catch {
    latestId = RANDOM_MAX;
  }
  return {
    trackId: query.trackId,
    backSideContent: json.data?.repository?.content?.text,
    latestId,
  };
};

export default Index;
