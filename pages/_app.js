import React from "react";
import "../styles/app.scss";
import "rc-slider/assets/index.css";

function MyApp({ Component, pageProps }) {
  return (
    <div>
      <Component {...pageProps} />
    </div>
  );
}

export default MyApp;
