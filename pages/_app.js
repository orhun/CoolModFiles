import Head from "next/head";
import "../styles/app.css";

function MyApp({ Component, pageProps }) {
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
