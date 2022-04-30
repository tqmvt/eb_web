import React, { memo, useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { init, fetchListings, filterListings, sortListings } from '../../GlobalState/marketplaceSlice';
import InfiniteScroll from 'react-infinite-scroll-component';
import { Spinner, Table } from 'react-bootstrap';
import { SortOption } from '../Models/sort-option.model';
import { shortAddress, timeSince } from '../../utils';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import TopFilterBar from './TopFilterBar';
import { marketPlaceCollectionFilterOptions } from './constants/filter-options';
import { sortOptions } from './constants/sort-options';
import { ListingsFilterOption } from '../Models/listings-filter-option.model';

const SalesCollection = ({
  showLoadMore = true,
  collectionId = null,
  tokenId = null,
  sellerId = null,
  cacheName = null,
}) => {
  const dispatch = useDispatch();

  const mobileListBreakpoint = 768;
  const [tableMobileView, setTableMobileView] = useState(window.innerWidth > mobileListBreakpoint);

  const listings = useSelector((state) => {
    return state.marketplace.listings;
  });
  const canLoadMore = useSelector((state) => {
    return state.marketplace.curPage === 0 || state.marketplace.curPage < state.marketplace.totalPages;
  });
  const isFetching = useSelector((state) => state.marketplace.loading);

  const marketplace = useSelector((state) => {
    return state.marketplace;
  });

  const defaultSort = () => {
    const defaultSort = new SortOption();
    defaultSort.key = 'saleTime';
    defaultSort.direction = 'desc';
    defaultSort.label = 'Sale Time';

    return defaultSort;
  };

  useEffect(() => {
    const sortOption = marketplace.cachedSort[cacheName] ?? defaultSort;

    if (collectionId) {
      const filterOption = new ListingsFilterOption();
      filterOption.type = 'collection';
      filterOption.address = collectionId;
      filterOption.name = 'By Collection';
      if (tokenId != null) {
        filterOption.id = tokenId;
      }

      dispatch(init(sortOption, filterOption));
      dispatch(fetchListings(true));
      return;
    }

    if (sellerId) {
      const filterOption = new ListingsFilterOption();
      filterOption.type = 'seller';
      filterOption.address = sellerId;
      filterOption.name = 'By Seller';

      dispatch(init(sortOption, filterOption));
      dispatch(fetchListings(true));
      return;
    }

    const filterOption = marketplace.cachedFilter[cacheName] ?? ListingsFilterOption.default();

    dispatch(init(sortOption, filterOption));
    dispatch(fetchListings(true));
  }, [dispatch]);

  const loadMore = () => {
    if (!isFetching) {
      dispatch(fetchListings(true));
    }
  };

  const selectDefaultFilterValue = marketplace.cachedFilter[cacheName] ?? ListingsFilterOption.default();
  const selectDefaultSortValue = marketplace.cachedSort[cacheName] ?? defaultSort;
  const selectFilterOptions = marketPlaceCollectionFilterOptions;
  const selectSortOptions = useSelector((state) => {
    return sortOptions
      .filter((s) => state.marketplace.hasRank || s.key !== 'rank')
      .map((o) => {
        if (o.key === 'listingId') {
          return defaultSort();
        }
        return o;
      });
  });

  const onFilterChange = useCallback(
    (filterOption) => {
      dispatch(filterListings(filterOption, cacheName, true));
    },
    [dispatch]
  );

  const onSortChange = useCallback(
    (sortOption) => {
      if (sortOption.key === null) {
        sortOption = defaultSort();
      }
      dispatch(sortListings(sortOption, cacheName, true));
    },
    [dispatch]
  );

  return (
    <>
      <div className="row">
        <div className="col-lg-12">
          <TopFilterBar
            showFilter={!collectionId}
            showSort={true}
            sortOptions={[SortOption.default(), ...selectSortOptions]}
            filterOptions={[ListingsFilterOption.default(), ...selectFilterOptions]}
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
        <Table responsive className="table de-table table-rank sales-table align-middle" data-mobile-responsive="true">
          <thead>
            <tr>
              <th scope="col" colSpan="2">
                Item
              </th>
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
                  <td style={{ minWidth: '50px' }}>
                    <Link to={`/listing/${listing.listingId}`}>
                      <img
                        className="lazy rounded"
                        src={listing.nft.image}
                        alt={listing.nft.name}
                        style={{ maxHeight: '75px' }}
                      />
                    </Link>
                  </td>
                  <th style={{ minWidth: '115px' }}>
                    <Link to={`/listing/${listing.listingId}`}>{listing.nft.name ?? 'Unknown'}</Link>
                  </th>
                  <td>{listing.nft.rank ?? '-'}</td>
                  <td style={{ minWidth: '100px' }}>{ethers.utils.commify(Math.round(listing.price))} CRO</td>
                  <td>
                    <Link to={`/seller/${listing.seller}`}>{shortAddress(listing.seller)}</Link>
                  </td>
                  <td>
                    <Link to={`/seller/${listing.purchaser}`}>{shortAddress(listing.purchaser)}</Link>
                  </td>
                  <td className="px-2" style={{ minWidth: '115px' }}>
                    {timeSince(listing.saleTime + '000')} ago
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
      </InfiniteScroll>
    </>
  );
};

export default memo(SalesCollection);
