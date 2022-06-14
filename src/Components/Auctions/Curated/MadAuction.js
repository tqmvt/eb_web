import React from 'react';

import Footer from '../../components/Footer';
import AuctionCollection from '../../components/AuctionCollection';
import MetaverseModal from '../../components/MetaverseModal';
import {hostedImage} from "../../../hacks";
import CuratedAuctionCollection from "./CuratedAuctionCollection";

const MadAuction = () => {
  return (
    <div>
      <section className="container no-bottom">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center pt-5">
              <h2>Mad Meerkat Legendary Auction</h2>
            </div>
          </div>
          <div className="col-lg-6 pt-3">
            <div className="card eb-nft__card h-100 shadow">
              <img className="card-img-top" src={hostedImage('/img/metaverse_gallery.png')} alt="metaverse gallery" />
              <div className="card-body d-flex flex-column align-middle">
                <MetaverseModal />
              </div>
            </div>
          </div>
          <div className="col-lg-6 text-center align-middle d-flex align-items-center">
            <div className="heading mt-3">Join our auction in the metaverse, or just make a bid below.</div>
          </div>
        </div>
      </section>
      <section className="container pt-5">
        <div className="row">
          <div className="col-lg-12 pt-3">
            <CuratedAuctionCollection collectionId="0xA19bFcE9BaF34b92923b71D487db9D0D051a88F8" />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default MadAuction;
