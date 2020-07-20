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
          <meta
            name="twitter:image"
            content="https://coolmodfiles.com/favicon-310.png"
          />

          <link rel="manifest" href="/manifest.json" />
          <meta name="theme-color" content="#fff" />
          <meta name="application-name" content="CoolModFiles" />
          <meta name="apple-mobile-web-app-title" content="CoolModFiles" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta
            name="apple-mobile-web-app-status-bar-style"
            content="default"
          />

          <link rel="shortcut icon" href="/favicon.ico" />
          <link rel="icon" sizes="16x16 32x32 64x64" href="/favicon.ico" />
          <link
            rel="icon"
            type="image/png"
            sizes="196x196"
            href="/favicon-192.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="160x160"
            href="/favicon-160.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="96x96"
            href="/favicon-96.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="64x64"
            href="/favicon-64.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="32x32"
            href="/favicon-32.png"
          />
          <link
            rel="icon"
            type="image/png"
            sizes="16x16"
            href="/favicon-16.png"
          />
          <link rel="apple-touch-icon" href="/favicon-57.png" />
          <link
            rel="apple-touch-icon"
            sizes="114x114"
            href="/favicon-114.png"
          />
          <link rel="apple-touch-icon" sizes="72x72" href="/favicon-72.png" />
          <link
            rel="apple-touch-icon"
            sizes="144x144"
            href="/favicon-144.png"
          />
          <link rel="apple-touch-icon" sizes="60x60" href="/favicon-60.png" />
          <link
            rel="apple-touch-icon"
            sizes="120x120"
            href="/favicon-120.png"
          />
          <link rel="apple-touch-icon" sizes="76x76" href="/favicon-76.png" />
          <link
            rel="apple-touch-icon"
            sizes="152x152"
            href="/favicon-152.png"
          />
          <link
            rel="apple-touch-icon"
            sizes="180x180"
            href="/favicon-180.png"
          />
          <meta name="msapplication-TileColor" content="#000000" />
          <meta name="msapplication-TileImage" content="/favicon-144.png" />
          <meta name="msapplication-config" content="/browserconfig.xml" />
          <script src="/chiptune2.js"></script>
          <script src="/libopenmpt.js"></script>
          <script
            data-ad-client="ca-pub-6716088693199036"
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"
          ></script>
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
