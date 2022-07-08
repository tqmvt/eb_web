import React from 'react';

import Footer from '../../components/Footer';
import AuctionCollection from '../../components/AuctionCollection';
import MetaverseModal from '../../components/MetaverseModal';
import CuratedAuctionCollection from "./CuratedAuctionCollection";
import Head from "next/head";
import {hostedImage} from "../../../helpers/image";
import PageHead from "../../Head/PageHead";

const Blood4NftAuction = () => {
  const name = 'Blood 4 NFT Auction';
  const description = 'Blood 4 NFT is a collection of whimsical blood vials to motivate the blood donors community with the power of the NFT.';
  const image = '/img/collections/blood-nft/banner.jpg';

  return (
    <>
      <PageHead
        title={name}
        description={description}
        url="/blood-4-nft"
        image={hostedImage(image)}
      />
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
