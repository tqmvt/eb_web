import { Html, Head, Main, NextScript } from 'next/document';

export default function Document() {
  return (
    <Html>
      <Head>
        <meta charSet="utf-8" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png?v=4" />
        <link rel="icon" type="image/png" href="/favicon.png" sizes="any" />
        <link rel="shortcut icon" type="image/png" href="/favicon.png" sizes="any" />
        <link rel="manifest" href="/site.webmanifest?v=3" />
        <link rel="mask-icon" href="/safari-pinned-tab.svg?v=3" color="#5bbad5" />
        <link
          href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
        <meta name="msapplication-TileColor" content="#ffc40d" />
        <meta name="theme-color" content="#ffffff" />
        <meta content="text/html;charset=utf-8" httpEquiv="Content-Type" />
        <meta content="" name="keywords" />
        <meta content="" name="author" />

        <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
      </Head>
      <body>
        <div id="initialLoader">
          <div className="loader"></div>
        </div>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
