import React, { memo, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner } from 'react-bootstrap';
// import InfiniteScroll from 'react-infinite-scroll-component';

import AuctionCard from './AuctionCard';
import { init, fetchListings } from '../../GlobalState/auctionsSlice';
import { auctionState } from '../../core/api/enums';
import {caseInsensitiveCompare} from "../../utils";
// import ListingCard from './ListingCard';
// import Clock from './Clock';
// import auction from '../pages/auction';
// import { auctionState } from '../../core/api/enums';

const testAuctions = [
  '0x0733025a8c1b52cc7d606dd0aa87a4b65f1305f4e51a7844855a001ffef0be20-0',
  '0xf34f5ba60241d674568d5c9b553071a20e138e057058531f72aca049421c1d58-0'
];

const degenAddress = '0xA19bFcE9BaF34b92923b71D487db9D0D051a88F8';

const AuctionCollection = ({ showLoadMore = true, collectionId = null, sellerId = null, cacheName = null }) => {
  const dispatch = useDispatch();
  const activeAuctions = useSelector((state) =>
    state.auctions.auctions.filter((a) =>
      typeof a.nft != 'undefined' &&
      [auctionState.ACTIVE, auctionState.NOT_STARTED].includes(a.state) &&
      caseInsensitiveCompare(a.nftAddress, degenAddress) &&
      !testAuctions.includes(a.id)
    )
  );
  const completedAuctions = useSelector((state) =>
    state.auctions.auctions.filter((a) =>
      typeof a.nft != 'undefined' &&
      [auctionState.SOLD, auctionState.CANCELLED].includes(a.state) &&
      caseInsensitiveCompare(a.nftAddress, degenAddress) &&
      !testAuctions.includes(a.id)
    )
      .sort((a, b) => a.endAt < b.endAt ? 1 : -1)
  );
  const isLoading = useSelector((state) => state.auctions.loading);

  // const canLoadMore = useSelector((state) => {
  //   return state.marketplace.curPage === 0 || state.marketplace.curPage < state.marketplace.totalPages;
  // });

  const marketplace = useSelector((state) => {
    return state.marketplace;
  });

  // const isFilteredOnCollection = useSelector((state) => {
  //   return (
  //     marketplace.curFilter !== null &&
  //     marketplace.curFilter.type === 'collection' &&
  //     marketplace.curFilter.address !== null
  //   );
  // });

  useEffect(() => {
    let sort = {
      type: 'listingId',
      direction: 'desc',
    };

    let filter = {
      type: null,
      address: null,
    };

    if (collectionId) {
      filter.type = 'collection';
      filter.address = collectionId;
    } else if (sellerId) {
      filter.type = 'seller';
      filter.address = sellerId;
    } else {
      //  if cacheName is supplied filter and sort values remain same after changing pages.
      const cachedFilter = marketplace.cachedFilter[cacheName];
      const cachedSort = marketplace.cachedSort[cacheName];

      if (cachedFilter) {
        filter.type = cachedFilter.type;
        filter.address = cachedFilter.address;
      }

      if (cachedSort) {
        sort.type = cachedSort.type;
        sort.direction = cachedSort.direction;
      }
    }
    dispatch(init(sort, filter));
    dispatch(fetchListings());
    // eslint-disable-next-line
  }, [dispatch]);

  // const loadMore = () => {
  //   dispatch(fetchListings());
  // };

  if (showLoadMore) {
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
                <div className="text-center">Degen auctions will be available soon!</div>
              )}
            </div>

            <div className="col-lg-12">
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
                <div className="text-center">Degen auctions will be available soon!</div>
              )}
            </div>
          </>
        )}
      </>
    );
  } else {
    return (
      <div className="row">
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
          <span>Degen auctions will be available soon!</span>
        )}
      </div>
    );
  }
};

export default memo(AuctionCollection);
