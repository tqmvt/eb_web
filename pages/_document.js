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

        {/* Primary Meta Tags */}
        <meta name="title" content="Ebisu's Bay — Cronos #1 NFT marketplace" />
        <meta
          name="description"
          content="The first NFT marketplace on Cronos. Create, buy, sell, trade and enjoy the #CroFam NFT community."
        />
        <meta
          name="keywords"
          content="Cronos, NFT, marketplace, first, community, nft marketplace, curated, launch, nft launch, crofam, collection, drop"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:site_name" content="Ebisu's Bay Marketplace" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://app.ebisusbay.com" />
        <meta property="og:title" content="Ebisu's Bay — Cronos #1 NFT marketplace" />
        <meta
          property="og:description"
          content="The first NFT marketplace on Cronos. Create, buy, sell, trade and enjoy the #CroFam NFT community."
        />
        <meta property="og:image" content="https://app.ebisusbay.com/img/background/Ebisus-bg-1_L.webp" />

        {/* Twitter */}
        <meta property="twitter:site" content="@EbisusBay" />
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://app.ebisusbay.com" />
        <meta property="twitter:title" content="Ebisu's Bay — Cronos #1 NFT marketplace" />
        <meta
          property="twitter:description"
          content="The first NFT marketplace on Cronos. Create, buy, sell, trade and enjoy the #CroFam NFT community."
        />
        <meta property="twitter:image" content="https://app.ebisusbay.com/img/background/Ebisus-bg-1_L.webp" />

        <link rel="manifest" href="%PUBLIC_URL%/manifest.json" />
      </Head>
      <body>
        <div id="initialLoader">
          <div class="loader"></div>
        </div>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
