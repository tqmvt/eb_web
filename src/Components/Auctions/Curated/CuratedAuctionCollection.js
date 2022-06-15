import React, {memo, useEffect, useState} from 'react';
import { Spinner } from 'react-bootstrap';

import {sortAndFetchAuctions} from "../../../core/api";
import AuctionCard from "../../components/AuctionCard";
import {caseInsensitiveCompare} from "../../../utils";
import {auctionState} from "../../../core/api/enums";
import {Auction} from "../../../core/models/auction";

const testAuctions = [];

const CuratedAuctionCollection = ({ collectionId = null}) => {

  const [isLoading, setIsLoading] = useState(false);
  const [completedAuctions, setCompletedAuctions] = useState([]);
  const [activeAuctions, setActiveAuctions] = useState([]);

  useEffect(() => {
    async function fetch() {
      setIsLoading(true);
      const response = await sortAndFetchAuctions();
      const auctions = response.auctions.map(o => new Auction(o));

      setActiveAuctions(auctions.filter((a) =>
        typeof a.nft != 'undefined' &&
        [auctionState.ACTIVE, auctionState.NOT_STARTED].includes(a.state) &&
        caseInsensitiveCompare(a.nftAddress, collectionId) &&
        !testAuctions.includes(a.id)
      ).sort((a, b) => a.endAt > b.endAt ? 1 : -1));

      setCompletedAuctions(auctions.filter((a) =>
        typeof a.nft != 'undefined' &&
        [auctionState.SOLD, auctionState.CANCELLED].includes(a.state) &&
        caseInsensitiveCompare(a.nftAddress, collectionId) &&
        !testAuctions.includes(a.id)
      ).sort((a, b) => a.endAt < b.endAt ? 1 : -1));
      setIsLoading(false);
    }
    if (collectionId) {
      fetch();
    }
  }, []);

  return (
    <>
      {isLoading ? (
        <div className="text-center">
          <Spinner animation="border" role="status" size="sm" className="ms-1">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <div className="col-lg-12">
            <div className="text-center">
              <h2>Active Auctions</h2>
            </div>
          </div>
          <div className="col-lg-12 pt-3">
            {activeAuctions?.length > 0 ? (
              <div className="card-group">
                {activeAuctions &&
                  activeAuctions.map((listing, index) => (
                    <div key={index} className="d-item col-xl-3 col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4 px-2">
                      <AuctionCard listing={listing} imgClass="marketplace" />
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-center">No active auctions</div>
            )}
          </div>

          <div className="col-lg-12 mt-4">
            <div className="text-center">
              <h2>Completed Auctions</h2>
            </div>
          </div>
          <div className="col-lg-12 pt-3">
            {completedAuctions?.length > 0 ? (
              <div className="card-group">
                {completedAuctions &&
                completedAuctions.map((listing, index) => (
                  <div key={index} className="d-item col-xl-3 col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4 px-2">
                    <AuctionCard listing={listing} imgClass="marketplace" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center">No completed auctions</div>
            )}
          </div>
        </>
      )}
    </>
  );
};

export default memo(CuratedAuctionCollection);
