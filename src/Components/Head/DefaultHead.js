import Head from "next/head";
import React from "react";

export const DefaultHead = () => {
  return (
    <Head>
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <meta name="viewport" content="width=device-width, minimum-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      <title>Ebisu's Bay Marketplace</title>

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
      <meta property="og:url" key="og_url" content="https://app.ebisusbay.com" />
      <meta property="og:title" key="og_title" content="Ebisu's Bay — Cronos #1 NFT marketplace" />
      <meta
        property="og:description"
        key="og_desc"
        content="The first NFT marketplace on Cronos. Create, buy, sell, trade and enjoy the #CroFam NFT community."
      />
      <meta property="og:image" key="og_img" content="https://app.ebisusbay.com/img/background/Ebisus-bg-1_L.webp" />

      {/* Twitter */}
      <meta property="twitter:site" content="@EbisusBay" />
      <meta property="twitter:card" key="twitter_card" content="summary_large_image" />
      <meta property="twitter:url" key="twitter_url" content="https://app.ebisusbay.com" />
      <meta property="twitter:title" key="twitter_title" content="Ebisu's Bay — Cronos #1 NFT marketplace" />
      <meta
        property="twitter:description"
        key="twitter_desc"
        content="The first NFT marketplace on Cronos. Create, buy, sell, trade and enjoy the #CroFam NFT community."
      />
      <meta property="twitter:image" key="twitter_img" content="https://app.ebisusbay.com/img/background/Ebisus-bg-1_L.webp" />

      <link
        href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@200;300;400;500;600;700;800&display=swap"
        rel="stylesheet"
      />
    </Head>
  )
}