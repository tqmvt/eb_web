import React, { useCallback } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import Head from 'next/head';

import ListingCollection from '../../src/Components/components/ListingCollection';
import Footer from '../../src/Components/components/Footer';
import TopFilterBar from '../../src/Components/components/TopFilterBar';
import { sortOptions } from '../../src/Components/components/constants/sort-options';
import { SortOption } from '../../src/Components/Models/sort-option.model';
import {searchListings, sortListings} from '../../src/GlobalState/marketplaceSlice';
import {debounce, shortAddress} from '../../src/utils';

const Seller = () => {
  const cacheName = 'sellerPage';
  const router = useRouter();
  const { address } = router.query;

  const dispatch = useDispatch();

  const marketplace = useSelector((state) => {
    return state.marketplace;
  });

  const selectDefaultSortValue = marketplace.query.sort ?? SortOption.default();
  const selectDefaultSearchValue = marketplace.query.filter.search ?? '';

  const selectSortOptions = useSelector((state) => {
    if (state.marketplace.hasRank) {
      return sortOptions;
    }

    return sortOptions.filter((s) => s.key !== 'rank');
  });

  const onSortChange = useCallback(
    (sortOption) => {
      dispatch(sortListings(sortOption, cacheName));
    },
    [dispatch]
  );

  const onSearch = debounce((event) => {
    const { value } = event.target;
    dispatch(searchListings(value, cacheName));
  }, 300);

  return (
    <div>
      <Head>
        <title>{shortAddress(address) || 'Seller'} | Ebisu's Bay Marketplace</title>
        <meta name="description" content={`${shortAddress(address) || 'Seller'} for Ebisu's Bay Marketplace`} />
        <meta name="title" content={`${shortAddress(address) || 'Seller'} | Ebisu's Bay Marketplace`} />
        <meta property="og:title" content={`${shortAddress(address) || 'Seller'} | Ebisu's Bay Marketplace`} />
        <meta property="og:url" content={`https://app.ebisusbay.com/seller/${address}`} />
        <meta name="twitter:title" content={`${shortAddress(address) || 'Seller'} | Ebisu's Bay Marketplace`} />
      </Head>
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12 text-center">
                <h1>Marketplace</h1>
                <p>
                  {address
                    ? `${address.substring(0, 4)}...${address.substring(address.length - 3, address.length)}`
                    : ''}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          <div className="col-lg-12">
            <TopFilterBar
              showFilter={false}
              showSort={true}
              sortPlaceHolder="Sort Listings..."
              sortOptions={[SortOption.default(), ...selectSortOptions]}
              defaultSortValue={selectDefaultSortValue}
              defaultSearchValue={selectDefaultSearchValue}
              onSortChange={onSortChange}
              onSearch={onSearch}
            />
          </div>
        </div>
        <ListingCollection sellerId={address} />
      </section>

      <Footer />
    </div>
  );
};
export default Seller;
