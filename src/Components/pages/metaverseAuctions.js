import React from 'react';

import Footer from '../components/Footer';
import AuctionCollection from '../components/AuctionCollection';
import config from '../../Assets/networks/rpc_config.json';
import {FilterOption} from "../Models/filter-option.model";

export const drops = config.drops;

function getMetaverseUrl() {
  if (window.location.host === "localhost:3000") {
    return "https://localhost:8080/?assignRoom=true"
  }
  if (window.location.host === "app.ebisusbay.biz") {
    return "https://metaverse.ebisusbay.biz/?assignRoom=true"
  }
  if (window.location.host === "testapp.ebisusbay.biz") {
    return "https://metaverse.ebisusbay.biz/?assignRoom=true"
  }
  if (window.location.host === "testapp2.ebisusbay.biz") {
    return "https://metaverse.ebisusbay.biz"
  }
  return "https://metaverse.ebisusbay.com/?assignRoom=true"
}

const MetaverseAuctions = () => {

  const metaverseUrl = getMetaverseUrl()

  return (
    <div>
      <section className="container no-bottom">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center pt-5">
              <h2>Metaverse Auction Gallery</h2>
            </div>
          </div>
          <div className="col-lg-6 pt-3">
            <div className="card eb-nft__card h-100 shadow">
              <img class="card-img-top" src="/img/metaverse_gallery.png" />
              <div className="card-body d-flex flex-column align-middle">
                <a className="btn-main lead mr15 mx-auto" href={metaverseUrl}>Enter Metaverse</a>
              </div>
            </div>
          </div>
          <div className="col-lg-6 text-center align-middle d-flex align-items-center">
            <div className="heading">Gather, share and collaborate together, in a virtual, private and safe place</div>
          </div>
        </div>
      </section>
      <section className="container pt-5">
        <div className="row">
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Active Metaverse Auctions</h2>
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
