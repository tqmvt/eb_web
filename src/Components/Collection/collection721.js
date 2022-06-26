import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Contract, ethers } from 'ethers';
import Blockies from 'react-blockies';
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from 'react-bootstrap';
import styled from 'styled-components';
import CollectionFilterBar from '../components/CollectionFilterBar';
import LayeredIcon from '../components/LayeredIcon';
import Footer from '../components/Footer';
import CollectionInfoBar from '../components/CollectionInfoBar';
import SalesCollection from '../components/SalesCollection';
import CollectionNftsGroup from '../components/CollectionNftsGroup';
import CollectionListingsGroup from '../components/CollectionListingsGroup';
import {init, fetchListings, getStats, updateTab} from '../../GlobalState/collectionSlice';
import { isCronosVerseCollection, isCrosmocraftsCollection } from '../../utils';
import TraitsFilter from './TraitsFilter';
import PowertraitsFilter from './PowertraitsFilter';
import SocialsBar from './SocialsBar';
import { CollectionSortOption } from '../Models/collection-sort-option.model';
import Market from '../../Contracts/Marketplace.json';
import stakingPlatforms from '../../core/data/staking-platforms.json';
import PriceRangeFilter from '../Collection/PriceRangeFilter';
import CollectionCronosverse from '../Collection/collectionCronosverse';
import {appConfig} from "../../Config";
import {hostedImage, ImageKitService} from "../../helpers/image";
import {useRouter} from "next/router";
import {CollectionFilters} from "../Models/collection-filters.model";
import {pushQueryString} from "../../helpers/query";

const config = appConfig();

const NegativeMargin = styled.div`
  margin-left: -1.75rem !important;
  margin-right: -1.75rem !important;
`;

const tabs = {
  items: 'items',
  activity: 'activity',
  map: 'map'
};

const Collection721 = ({ collection,  cacheName = 'collection', query }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const readProvider = new ethers.providers.JsonRpcProvider(config.rpc.read);
  const readMarket = new Contract(config.contracts.market, Market.abi, readProvider);

  const [royalty, setRoyalty] = useState(null);

  const collectionStatsLoading = useSelector((state) => state.collection.statsLoading);
  const collectionStats = useSelector((state) => state.collection.stats);
  const collectionLoading = useSelector((state) => state.collection.loading);
  const initialLoadComplete = useSelector((state) => state.collection.initialLoadComplete);

  const [isFirstLoaded, setIsFirstLoaded] = useState(0);

  const listings = useSelector((state) => state.collection.listings);
  const hasRank = useSelector((state) => state.collection.hasRank);
  const canLoadMore = useSelector((state) => {
    return (
      state.collection.listings.length > 0 &&
      (state.collection.query.page === 0 || state.collection.query.page < state.collection.totalPages)
    );
  });

  const isUsingListingsFallback = useSelector((state) => state.collection.isUsingListingsFallback);

  const [openMenu, setOpenMenu] = useState(0);
  const handleBtnClick = (key) => (element) => {
    setOpenMenu(key);

    if (key === tabs.items) {
      resetFilters();
    }

    pushQueryString(router, {
      slug: router.query.slug,
      tab: key
    });
    dispatch(updateTab(key));
  };

  const resetFilters = (preservedQuery) => {
    const sortOption = CollectionSortOption.default();
    sortOption.key = 'price';
    sortOption.direction = 'asc';
    sortOption.label = 'By Price';

    const filterOption = preservedQuery ? CollectionFilters.fromQuery(preservedQuery) : CollectionFilters.default();
    filterOption.address = collection.mergedAddresses
      ? [collection.address, ...collection.mergedAddresses]
      : collection.address;

    dispatch(init(filterOption, sortOption));
    dispatch(fetchListings());
  }

  const hasTraits = () => {
    return collectionStats?.traits != null && Object.entries(collectionStats?.traits).length > 0;
  };

  const hasPowertraits = () => {
    return collectionStats?.powertraits != null && Object.entries(collectionStats?.powertraits).length > 0;
  };

  const loadMore = () => {
    dispatch(fetchListings());
  };

  useEffect(() => {
    resetFilters(query);
    setOpenMenu(query.tab ?? tabs.items);
    // eslint-disable-next-line
  }, [dispatch, collection.address]);

  useEffect(() => {
    async function asyncFunc() {
      dispatch(getStats(collection.address, collection.slug, null, collection.mergedAddresses));
      try {
        let royalties = await readMarket.royalties(collection.address);
        setRoyalty(Math.round(royalties[1]) / 100);
      } catch (error) {
        console.log('error retrieving royalties for collection', error);
        setRoyalty('N/A');
      }
    }
    asyncFunc();
    // eslint-disable-next-line
  }, [dispatch, collection]);

  useEffect(() => {
    if (collectionLoading && isFirstLoaded === 0) {
      setIsFirstLoaded(1);
    }
    if (!collectionLoading && isFirstLoaded === 1) {
      setIsFirstLoaded(2);
    }
  }, [collectionLoading, isFirstLoaded]);

  return (
    <div>
      <section
        id="profile_banner"
        className="jumbotron breadcumb no-bg"
        style={{
          backgroundImage: `url(${ImageKitService.buildBannerUrl(collection.metadata.banner ?? '')})`,
          backgroundPosition: '50% 50%',
        }}
      >
        <div className="mainbreadcumb"></div>
      </section>

      <section className="container d_coll no-top no-bottom">
        <div className="row">
          <div className="col-md-12">
            <div className="d_profile">
              <div className="profile_avatar">
                <div className="d_profile_img">
                  {collection.metadata.avatar ? (
                    <img src={hostedImage(collection.metadata.avatar)} alt={collection.name} />
                  ) : (
                    <Blockies seed={collection.address.toLowerCase()} size={15} scale={10} />
                  )}
                  {collection.metadata.verified && (
                    <LayeredIcon icon={faCheck} bgIcon={faCircle} shrink={8} stackClass="eb-avatar_badge" />
                  )}
                </div>

                <div className="profile_name">
                  <h4>
                    {collection.name}
                    <div className="clearfix" />
                  </h4>
                  {collection.metadata.description && <p>{collection.metadata.description}</p>}
                  <span className="fs-4">
                    <SocialsBar address={collection.address} collection={collection.metadata} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container no-top">
        {collectionStats && (
          <div className="row">
            {hasRank && collection.metadata.rarity === 'rarity_sniper' && (
              <div className="row">
                <div className="col-lg-8 col-sm-10 mx-auto text-center mb-3" style={{ fontSize: '0.8em' }}>
                  Rarity scores and ranks provided by{' '}
                  <a href="https://raritysniper.com/" target="_blank" rel="noreferrer">
                    <span className="color">Rarity Sniper</span>
                  </a>
                </div>
              </div>
            )}
            <CollectionInfoBar collectionStats={collectionStats} royalty={royalty} />
            {collection.address.toLowerCase() === '0x7D5f8F9560103E1ad958A6Ca43d49F954055340a'.toLowerCase() && (
              <div className="row m-3">
                <div className="mx-auto text-center fw-bold" style={{ fontSize: '1.2em' }}>
                  {'  '} Please visit{' '}
                  <a href="/collection/weird-apes-club-v2">
                    <span className="color">here </span>
                  </a>
                  for the newer, migrated contract until these pages are unified
                </div>
              </div>
            )}
            {isCrosmocraftsCollection(collection.address) && (
              <div className="row">
                <div className="mx-auto text-center fw-bold" style={{ fontSize: '0.8em' }}>
                  Got Crosmocraft parts?{' '}
                  <a href="/build-ship">
                    <span className="color">build your Crosmocraft!</span>
                  </a>
                </div>
              </div>
            )}
            {collection.metadata.staking && (
              <div className="row">
                <div className="mx-auto text-center fw-bold" style={{ fontSize: '0.8em' }}>
                  NFTs from this collection can be staked at{' '}
                  <a href={stakingPlatforms[collection.metadata.staking].url} target="_blank" rel="noreferrer">
                    <span className="color">{stakingPlatforms[collection.metadata.staking].name}</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="de_tab">
          <ul className="de_nav mb-2">
            <li id="Mainbtn0" className={`tab ${openMenu === tabs.items ? 'active' : ''}`}>
              <span onClick={handleBtnClick('items')}>Items</span>
            </li>
            <li id="Mainbtn1" className={`tab ${openMenu === tabs.activity ? 'active' : ''}`}>
              <span onClick={handleBtnClick('activity')}>Activity</span>
            </li>
            {isCronosVerseCollection(collection.address) && (
              <li id="Mainbtn9" className={`tab ${openMenu === tabs.map ? 'active' : ''}`}>
                <span onClick={handleBtnClick('map')}>Map</span>
              </li>
            )}
          </ul>

          <div className="de_tab_content">
            {openMenu === tabs.items && (
              <div className="tab-1 onStep fadeIn">
                <div className="row">
                  <CollectionFilterBar
                    showFilter={false}
                    cacheName={cacheName}
                    address={collection.address}
                    traits={collectionStats?.traits}
                    powertraits={collectionStats?.powertraits}
                  />
                </div>
                <div className="row">
                  {collectionStatsLoading ? (
                    <></>
                  ) : (
                    // <div className="col-md-3 mb-4">
                    //   <Skeleton count={5} type="rect" />
                    // </div>
                    <div className="col-md-3 mb-4">
                      <PriceRangeFilter className="mb-3" address={collection.address} />
                      {hasTraits() && <TraitsFilter address={collection.address} />}
                      {hasPowertraits() && <PowertraitsFilter address={collection.address} />}
                    </div>
                  )}
                  <div className="col-md-9">
                    {isUsingListingsFallback ? (
                      <CollectionListingsGroup listings={listings} canLoadMore={canLoadMore} loadMore={loadMore} />
                    ) : (
                      <CollectionNftsGroup
                        listings={listings}
                        royalty={royalty}
                        canLoadMore={canLoadMore}
                        loadMore={loadMore}
                        collection={collection}
                        initialLoadComplete={initialLoadComplete}
                      />
                    )}
                    {isFirstLoaded !== 2 && collectionLoading && (
                      <div className="row mt-5">
                        <div className="col-lg-12 text-center">
                          <Spinner animation="border" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </Spinner>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            {openMenu === tabs.activity && (
              <div className="tab-2 onStep fadeIn">
                <SalesCollection cacheName="collection" collectionId={collection.address} />
              </div>
            )}
            {openMenu === tabs.map && (
              <NegativeMargin className="tab-2 onStep fadeIn overflow-auto mt-2">
                <CollectionCronosverse collection={collection} slug={collection.slug} cacheName={collection.slug} />
              </NegativeMargin>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Collection721;
