import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Head from 'next/head';
import { Contract, ethers } from 'ethers';
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import Blockies from 'react-blockies';

import Footer from '../components/Footer';
import CollectionListingsGroup from '../components/CollectionListingsGroup';
// import CollectionFilterBar from '../src/Components/components/CollectionFilterBar';
import LayeredIcon from '../components/LayeredIcon';
import { init, fetchListings, getStats } from '../../GlobalState/collectionSlice';
import { isCrosmocraftsPartsCollection } from '../../utils';
// import TraitsFilter from '../Collection/TraitsFilter';
// import PowertraitsFilter from '../Collection/PowertraitsFilter';
import SocialsBar from './SocialsBar';
import { CollectionSortOption } from '../Models/collection-sort-option.model';
import { FilterOption } from '../Models/filter-option.model';
import Market from '../../Contracts/Marketplace.json';
import CollectionInfoBar from '../components/CollectionInfoBar';
import stakingPlatforms from '../../core/data/staking-platforms.json';
import SalesCollection from '../components/SalesCollection';
import CollectionNftsGroup from '../components/CollectionNftsGroup';
import {appConfig} from "../../Config";
import {ImageKitService} from "../../helpers/image";

const config = appConfig();

const Collection1155 = ({ collection, tokenId = null, cacheName = 'collection', slug }) => {
  const dispatch = useDispatch();

  const readProvider = new ethers.providers.JsonRpcProvider(config.rpc.read);
  const readMarket = new Contract(config.contracts.market, Market.abi, readProvider);

  const [royalty, setRoyalty] = useState(null);
  const [metadata, setMetadata] = useState(null);

  const collectionCachedTraitsFilter = useSelector((state) => state.collection.cachedTraitsFilter);
  const collectionCachedSort = useSelector((state) => state.collection.cachedSort);
  const collectionStats = useSelector((state) => state.collection.stats);

  const listings = useSelector((state) => state.collection.listings);
  const hasRank = useSelector((state) => state.collection.hasRank);
  const canLoadMore = useSelector((state) => {
    return (
      state.collection.listings.length > 0 &&
      (state.collection.query.page === 0 || state.collection.query.page < state.collection.totalPages)
    );
  });

  const collectionMetadata = useSelector((state) => {
    return collection.metadata;
  });
  const isUsingListingsFallback = useSelector((state) => state.collection.isUsingListingsFallback);

  const collectionName = () => {
    return collection.name;
  };

  const [openMenu, setOpenMenu] = React.useState(0);
  const handleBtnClick = (index) => (element) => {
    if (typeof window === 'undefined') {
      return;
    }
    var elements = document.querySelectorAll('.tab');
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
    }
    element.target.parentElement.classList.add('active');

    setOpenMenu(index);
  };

  const loadMore = () => {
    dispatch(fetchListings());
  };

  useEffect(() => {
    const sortOption = CollectionSortOption.default();
    sortOption.key = 'price';
    sortOption.direction = 'asc';
    sortOption.label = 'By Price';

    const filterOption = FilterOption.default();
    filterOption.type = 'collection';
    filterOption.address = collection.address;
    if (tokenId != null) {
      filterOption.id = tokenId;
    }
    filterOption.name = 'Specific collection';

    dispatch(
      init(
        filterOption,
        collectionCachedSort[cacheName] ?? sortOption,
        collectionCachedTraitsFilter[collection.address] ?? {},
        collection.address
      )
    );
    dispatch(fetchListings());
    // eslint-disable-next-line
  }, [dispatch, collection]);

  useEffect(() => {
    setMetadata(collection.metadata);
  }, [collection]);

  useEffect(() => {
    async function asyncFunc() {
      if (tokenId != null) {
        dispatch(getStats(collection.address, slug, tokenId));
      } else {
        dispatch(getStats(collection.address));
      }
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

  return (
    <div>
      <section
        id="profile_banner"
        className="jumbotron breadcumb no-bg"
        style={{
          backgroundImage: `url(${ImageKitService.buildBannerUrl(metadata?.banner ?? '')})`,
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
                  {metadata?.avatar ? (
                    <img src={metadata.avatar} alt={collectionName()} />
                  ) : (
                    <Blockies seed={collection.address.toLowerCase()} size={15} scale={10} />
                  )}
                  {metadata?.verified && (
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
                  <SocialsBar
                    address={collection.address}
                    collection={collection.metadata}
                  />
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
            {hasRank && collectionMetadata?.rarity === 'rarity_sniper' && (
              <div className="row">
                <div className="col-lg-8 col-sm-10 mx-auto text-center mb-3" style={{ fontSize: '0.8em' }}>
                  Rarity scores and ranks provided by{' '}
                  <a href="https://raritysniper.com/" target="_blank" rel="noreferrer">
                    <span className="color">Rarity Sniper</span>
                  </a>
                </div>
              </div>
            )}
            <div className="d-item col-md-12 mx-auto">
              <CollectionInfoBar collectionStats={collectionStats} royalty={royalty} />
            </div>
            {isCrosmocraftsPartsCollection(collection.address) && (
              <div className="row mb-2">
                <div className="mx-auto text-center fw-bold" style={{ fontSize: '0.8em' }}>
                  Collect Crosmocraft parts to{' '}
                  <a href="/build-ship">
                    <span className="color">build your Crosmocraft!</span>
                  </a>
                </div>
              </div>
            )}
            {collectionMetadata?.staking && (
              <div className="row">
                <div className="mx-auto text-center fw-bold" style={{ fontSize: '0.8em' }}>
                  NFTs from this collection can be staked at{' '}
                  <a href={stakingPlatforms[collectionMetadata.staking].url} target="_blank" rel="noreferrer">
                    <span className="color">{stakingPlatforms[collectionMetadata.staking].name}</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="de_tab">
          <ul className="de_nav mb-4">
            <li id="Mainbtn0" className="tab active">
              <span onClick={handleBtnClick(0)}>Items</span>
            </li>
            <li id="Mainbtn1" className="tab">
              <span onClick={handleBtnClick(1)}>Activity</span>
            </li>
          </ul>

          <div className="de_tab_content">
            {openMenu === 0 && (
              <div className="tab-1 onStep fadeIn">
                <div className="row">
                  <div className="col-md-12">
                    {isUsingListingsFallback ? (
                      <CollectionListingsGroup listings={listings} canLoadMore={canLoadMore} loadMore={loadMore} />
                    ) : (
                      <CollectionNftsGroup
                        listings={listings}
                        royalty={royalty}
                        canLoadMore={canLoadMore}
                        loadMore={loadMore}
                        address={collection.address}
                        collection={collection}
                      />
                    )}
                  </div>
                </div>
              </div>
            )}
            {openMenu === 1 && (
              <div className="tab-2 onStep fadeIn">
                <SalesCollection cacheName="collection" collectionId={collection.address} tokenId={tokenId} />
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Collection1155;
