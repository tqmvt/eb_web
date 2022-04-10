import React, {memo, useCallback, useEffect} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ListingCard from './ListingCard';
import {init, fetchListings, filterListings, sortListings} from '../../GlobalState/marketplaceSlice';
import InfiniteScroll from 'react-infinite-scroll-component';
import {Spinner, Table} from 'react-bootstrap';
import { SortOption } from '../Models/sort-option.model';

import { FilterOption } from '../Models/filter-option.model';
import HiddenCard from './HiddenCard';
import {isMetapixelsCollection, shortAddress, timeSince} from "../../utils";
import {Link} from "react-router-dom";
import Blockies from "react-blockies";
import {ethers} from "ethers";
import config from '../../Assets/networks/rpc_config.json';
import TopFilterBar from "./TopFilterBar";
import {marketPlaceCollectionFilterOptions} from "./constants/filter-options";
import {sortOptions} from "./constants/sort-options";
const knownContracts = config.known_contracts;

const SalesCollection = ({ showLoadMore = true, collectionId = null, sellerId = null, cacheName = null }) => {
  const dispatch = useDispatch();
  const listings = useSelector((state) => {
    return state.marketplace.listings
      .slice()
      .sort((a, b) => a.saleTime < b.saleTime ? 1 : -1)
  });

  const canLoadMore = useSelector((state) => {
    return state.marketplace.curPage === 0 || state.marketplace.curPage < state.marketplace.totalPages;
  });
  const isFetching = useSelector((state) => state.marketplace.loading);

  const marketplace = useSelector((state) => {
    return state.marketplace;
  });

  useEffect(() => {
    if (collectionId) {
      const sortOption = new SortOption();
      sortOption.key = 'listingId';
      sortOption.direction = 'desc';
      sortOption.label = 'By Id';

      const filterOption = new FilterOption();
      filterOption.type = 'collection';
      filterOption.address = collectionId;
      filterOption.name = 'By Collection';

      dispatch(init(sortOption, filterOption));
      dispatch(fetchListings(true));
      return;
    }

    if (sellerId) {
      const sortOption = new SortOption();
      sortOption.key = 'listingId';
      sortOption.direction = 'desc';
      sortOption.label = 'By Id';

      const filterOption = new FilterOption();
      filterOption.type = 'seller';
      filterOption.address = sellerId;
      filterOption.name = 'By Seller';

      dispatch(init(sortOption, filterOption));
      dispatch(fetchListings(true));
      return;
    }

    const filterOption = marketplace.cachedFilter[cacheName] ?? FilterOption.default();
    const sortOption = marketplace.cachedSort[cacheName] ?? SortOption.default();

    dispatch(init(sortOption, filterOption));
    dispatch(fetchListings(true));
  }, [dispatch]);

  const loadMore = () => {
    if (!isFetching) {
      dispatch(fetchListings(true));
    }
  };

  const selectDefaultFilterValue = marketplace.cachedFilter[cacheName] ?? FilterOption.default();
  const selectDefaultSortValue = marketplace.cachedSort[cacheName] ?? SortOption.default();
  const selectFilterOptions = marketPlaceCollectionFilterOptions;
  const selectSortOptions = useSelector((state) => {
    if (state.marketplace.hasRank) {
      return sortOptions;
    }

    return sortOptions.filter((s) => s.key !== 'rank');
  });

  const onFilterChange = useCallback((filterOption) => {
    dispatch(filterListings(filterOption, cacheName, true));
  }, [dispatch]);

  const onSortChange = useCallback(
    (sortOption) => {
      dispatch(sortListings(sortOption, cacheName, true));
    },
    [dispatch]
  );

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <TopFilterBar
            showFilter={true}
            showSort={true}
            sortOptions={[SortOption.default(), ...selectSortOptions]}
            filterOptions={[FilterOption.default(), ...selectFilterOptions]}
            defaultSortValue={selectDefaultSortValue}
            defaultFilterValue={selectDefaultFilterValue}
            filterPlaceHolder="Filter Collection..."
            sortPlaceHolder="Sort Listings..."
            onFilterChange={onFilterChange}
            onSortChange={onSortChange}
          />
        </div>
      </div>
      <InfiniteScroll
        dataLength={listings.length}
        next={loadMore}
        hasMore={canLoadMore}
        style={{ overflow: 'hidden' }}
        loader={
          <div className="row">
            <div className="col-lg-12 text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </div>
        }
        endMessage={() => {
          if (listings.length) {
            return (
              <div className="row mt-4">
                <div className="col-lg-12 text-center">
                  <span>Nothing to see here...</span>
                </div>
              </div>
            );
          }
        }}
      >
        <div className="row">
          <div className="col-lg-12">
            <Table responsive className="table de-table table-rank" data-mobile-responsive="true">
              <thead>
              <tr>
                <th scope="col">Item</th>
                <th scope="col">Rank</th>
                <th scope="col">Price</th>
                <th scope="col">From</th>
                <th scope="col">To</th>
                <th scope="col">Time</th>
              </tr>
              <tr />
              </thead>
              <tbody>
              {listings &&
              listings.map((listing, index) => (
                <tr key={index}>
                  <th scope="row" className="row gap-4 border-bottom-0">
                    <div className="col-12">
                      <div className="coll_list_pp" style={{ cursor: 'pointer' }}>
                        <Link to={`/listing/${listing.listingId}`}>
                          {listing.nft.image ? (
                            <img className="lazy" src={listing.nft.image} alt={listing.nft.name} style={{maxHeight:'50px'}}/>
                          ) : (
                            <Blockies seed={listing.nftAddress.toLowerCase()} size={10} scale={5} />
                          )}
                        </Link>
                      </div>
                      <span>
                      <Link to={`/listing/${listing.listingId}`}>{listing.nft.name ?? 'Unknown'}</Link>
                    </span>
                    </div>

                  </th>
                  <td>{listing.nft.rank ?? '-'}</td>
                  <td>{ethers.utils.commify(Math.round(listing.price))} CRO</td>
                  <td>
                    <Link to={`/seller/${listing.seller}`}>{shortAddress(listing.seller)}</Link>
                  </td>
                  <td>
                    <Link to={`/seller/${listing.purchaser}`}>{shortAddress(listing.purchaser)}</Link>
                  </td>
                  <td>{timeSince(listing.saleTime + '000')} ago</td>
                </tr>
              ))}
              </tbody>
            </Table>
          </div>
        </div>
      </InfiniteScroll>
    </>
  );

};

export default memo(SalesCollection);
