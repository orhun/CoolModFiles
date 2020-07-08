import { useEffect } from "react";
import Head from "next/head";
import "../styles/app.scss";
import "rc-slider/assets/index.css";

import { getRandomFromArray, BG_IMAGES } from "../utils";

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    document.body.style.backgroundImage = `url('/images/${getRandomFromArray(
      BG_IMAGES
    )}')`;
  }, []);

  return (
    <div>
      <Head>
        <script src="/chiptune2.js"></script>
        <script src="/libopenmpt.js"></script>
      </Head>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
