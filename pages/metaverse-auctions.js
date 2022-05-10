import React from 'react';

import Footer from '../src/Components/components/Footer';
import AuctionCollection from '../src/Components/components/AuctionCollection';
import config from '../src/Assets/networks/rpc_config.json';
import MetaverseModal from '../src/Components/components/MetaverseModal';
export const drops = config.drops;

const MetaverseAuctions = () => {
  return (
    <div>
      <section className="container no-bottom">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center pt-5">
              <h2>Auctions</h2>
            </div>
          </div>
          <div className="col-lg-6 pt-3">
            <div className="card eb-nft__card h-100 shadow">
              <img className="card-img-top" src="/img/metaverse_gallery.png" alt="metaverse gallery" />
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
          <div className="col-lg-12">
            <div className="text-center">
              <h2>2D Active Auctions</h2>
            </div>
          </div>
          <div className="col-lg-12 pt-3">
            <AuctionCollection />
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
};
export default MetaverseAuctions;
