import Document, { Html, Head, Main, NextScript } from "next/document";

class MyDocument extends Document {
  static async getInitialProps(ctx) {
    const initialProps = await Document.getInitialProps(ctx);
    return { ...initialProps };
  }

  render() {
    return (
      <Html lang="en">
        <Head>
          {/* base */}
          <meta charSet="utf-8" />
          <meta httpEquiv="x-ua-compatible" content="ie=edge" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta
            name="description"
            content="A web player that plays some cool MOD files randomly 🎶"
          />
          {/* twitter */}
          <meta name="twitter:card" content="summary" />
          <meta name="twitter:url" content="https://coolmodfiles.com/" />
          <meta name="twitter:title" content="CoolModFiles" />
          <meta
            name="twitter:description"
            content="A web player that plays some cool MOD files randomly 🎶"
          />

          <link rel="apple-touch-icon" sizes="180x180" href="./favicon.ico" />
          <link rel="icon" type="image/x-icon" href="./favicon.ico" />
          <script src="/chiptune2.js"></script>
          <script src="/libopenmpt.js"></script>
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
