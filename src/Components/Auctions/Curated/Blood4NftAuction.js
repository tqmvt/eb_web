import React from 'react';

import Footer from '../../components/Footer';
import AuctionCollection from '../../components/AuctionCollection';
import MetaverseModal from '../../components/MetaverseModal';
import {hostedImage} from "../../../hacks";
import CuratedAuctionCollection from "./CuratedAuctionCollection";
import Head from "next/head";

const Blood4NftAuction = () => {
  const name = 'Blood 4 NFT Auction';
  const description = 'Blood 4 NFT is a collection of whimsical blood vials to motivate the blood donors community with the power of the NFT.';
  const image = '/img/collections/blood-nft/banner.jpg';

  return (
    <>
      <Head>
        <title>{name} | Ebisu's Bay Marketplace</title>
        <meta name="description" content={description} />
        <meta name="title" content={`${name} | Ebisu's Bay Marketplace`} />
        <meta property="og:type" content="website" key="og_type" />
        <meta property="og:title" content={`${name} | Ebisu's Bay Marketplace`} key="title" />
        <meta property="og:url" content="https://app.ebisusbay.com/auctions/blood-4-nft" key="og_url" />
        <meta property="og:image" content={hostedImage(image)} key="image" />
        <meta property="og:description" content={description} />
        <meta property="og:site_name" content="Ebisu's Bay Marketplace" />
        <meta name="twitter:title" content={`${name} | Ebisu's Bay Marketplace`} key="twitter_title" />
        <meta name="twitter:image" content={image} key="twitter_image" />
        <meta name="twitter:card" content="summary_large_image" key="misc-card" />
        <meta name="twitter:site" content="Ebisu's Bay Marketplace" key="twitter_site" />
      </Head>
      <section className="container no-bottom no-top">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center pt-5">
              <h2>Blood 4 NFT Auction</h2>
              <p>Blood 4 NFT is a collection of whimsical blood vials.</p>
              <p>
                The objective of this project is to motivate the blood donors community with the power of the NFT.
                14 unique Vials were created paying respect to projects on the Cronos chain by an independent Houston artist.
              </p>
              <p>
                The unique Vials will be auctioned off on Ebisu's Bay June 14 2022 on Worlds Blood Donor Day.
              </p>
              <p>
                #BLOOD4NFT.
              </p>
              <p>
                The project utility is a badge of Honor to Texas Children's Hospital; MD Anderson Cancer Center; Gulf Coast Regional
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="container pt-5">
        <div className="row">
          <div className="col-lg-12 pt-3">
            <CuratedAuctionCollection collectionId="0xCF30e6C7D977F217734e5A265554a016760928E7" />
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};
export default Blood4NftAuction;
