import React from "react";
import "react-toastify/dist/ReactToastify.css";
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
