import { useEffect } from "react";
import Head from "next/head";
import "../styles/app.scss";
import "rc-slider/assets/index.css";

import {getRandomInt} from "../utils";


function MyApp({ Component, pageProps }) {
  useEffect(() => {
    document.body.style.backgroundImage = `url('/images/bg_${getRandomInt(0, 2)}.jpg')`
  }, [])

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
