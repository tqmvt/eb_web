import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Contract, ethers } from 'ethers';
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import Blockies from 'react-blockies';
import { Helmet } from 'react-helmet';
import Footer from '../components/Footer';
import CollectionListingsGroup from '../components/CollectionListingsGroup';
import CollectionFilterBar from '../components/CollectionFilterBar';
import LayeredIcon from '../components/LayeredIcon';
import { init, fetchListings, getStats } from '../../GlobalState/collectionSlice';
import {
  caseInsensitiveCompare, isCrosmocraftsCollection,
  siPrefixedNumber
} from '../../utils';
import TraitsFilter from '../Collection/TraitsFilter';
import PowertraitsFilter from '../Collection/PowertraitsFilter';
import SocialsBar from '../Collection/SocialsBar';
import { SortOption } from '../Models/sort-option.model';
import { FilterOption } from '../Models/filter-option.model';
import config from '../../Assets/networks/rpc_config.json';
import Market from '../../Contracts/Marketplace.json';
import stakingPlatforms from '../../core/data/staking-platforms.json';

const knownContracts = config.known_contracts;

const Collection721 = ({ collection, cacheName = 'collection' }) => {
  const dispatch = useDispatch();

  const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
  const readMarket = new Contract(config.market_contract, Market.abi, readProvider);

  const [royalty, setRoyalty] = useState(null);

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

  // const handleCopy = (code) => () => {
  //   navigator.clipboard.writeText(code);
  //   toast.success('Copied!');
  // };

  const hasTraits = () => {
    return collectionStats?.traits != null;
  };

  const hasPowertraits = () => {
    return collectionStats?.powertraits != null;
  };

  const loadMore = () => {
    dispatch(fetchListings());
  };

  useEffect(() => {
    const sortOption = SortOption.default();
    sortOption.key = 'listingId';
    sortOption.direction = 'desc';
    sortOption.label = 'By Id';

    const filterOption = FilterOption.default();
    filterOption.type = 'collection';
    filterOption.address = collection.address;
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
  }, [dispatch, collection.address]);

  useEffect(() => {
    async function asyncFunc() {
      dispatch(getStats(collection.address));
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
      <Helmet>
        <title>{collection.name} | Ebisu's Bay Marketplace</title>
        <meta name="description" content={`${collection.name} for Ebisu's Bay Marketplace`} />
        <meta name="title" content={`${collection.name} | Ebisu's Bay Marketplace`} />
        <meta property="og:title" content={`${collection.name} | Ebisu's Bay Marketplace`} />
        <meta property="og:url" content={`https://app.ebisusbay.com/collection/${collection.slug}`} />
        <meta property="og:image" content={`https://app.ebisusbay.com${collection.metadata.avatar || '/'}`} />
        <meta name="twitter:title" content={`${collection.name} | Ebisu's Bay Marketplace`} />
        <meta name="twitter:image" content={`https://app.ebisusbay.com${collection.metadata.avatar || '/'}`} />
      </Helmet>
      <section
        id="profile_banner"
        className="jumbotron breadcumb no-bg"
        style={{
          backgroundImage: `url(${collection.metadata.banner ?? '/img/background/subheader-blue.webp'})`,
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
                    <img src={collection.metadata.avatar} alt={collection.name} />
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
                  {collection.metadata.description && (
                      <p>{collection.metadata.description}</p>
                  )}
                  <span className="fs-4">
                    <SocialsBar collection={knownContracts.find((c) => caseInsensitiveCompare(c.address, collection.address))} />
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
                <div className="col-lg-8 col-sm-10 mx-auto text-center text-sm-end fst-italic" style={{ fontSize: '0.8em' }}>
                  Rarity scores and ranks provided by{' '}
                  <a href="https://raritysniper.com/" target="_blank" rel="noreferrer">
                    <span className="color">Rarity Sniper</span>
                  </a>
                </div>
              </div>
            )}
            <div className="d-item col-lg-8 col-sm-10 mb-4 mx-auto">
              <div className="nft_attr">
                <div className="row">
                  <div className="col-md-2 col-xs-4">
                    <h5>Floor</h5>
                    {collectionStats.floorPrice ? (
                      <h4>{siPrefixedNumber(Number(collectionStats.floorPrice).toFixed(0))} CRO</h4>
                    ) : (
                      <h4>-</h4>
                    )}
                  </div>
                  <div className="col-md-2 col-xs-4">
                    <h5>Volume</h5>
                    {collectionStats.totalVolume ? (
                      <h4>{siPrefixedNumber(Number(collectionStats.totalVolume).toFixed(0))} CRO</h4>
                    ) : (
                      <h4>-</h4>
                    )}
                  </div>
                  <div className="col-md-2 col-xs-4">
                    <h5>Sales</h5>
                    {collectionStats.numberOfSales ? (
                      <h4>{siPrefixedNumber(collectionStats.numberOfSales)}</h4>
                    ) : (
                      <h4>-</h4>
                    )}
                  </div>
                  <div className="col-md-2 col-xs-4">
                    <h5>Avg. Sale</h5>
                    {collectionStats.averageSalePrice ? (
                      <h4>{siPrefixedNumber(Number(collectionStats.averageSalePrice).toFixed(0))} CRO</h4>
                    ) : (
                      <h4>-</h4>
                    )}
                  </div>
                  <div className="col-md-2 col-xs-4">
                    <h5>Royalty</h5>
                    {royalty ? <h4>{royalty}%</h4> : <h4>-</h4>}
                  </div>
                  <div className="col-md-2 col-xs-4">
                    <h5>Active Listings</h5>
                    {collectionStats.numberActive ? (
                      <h4>{siPrefixedNumber(collectionStats.numberActive)}</h4>
                    ) : (
                      <h4>-</h4>
                    )}
                  </div>
                </div>
              </div>
            </div>
            {collection.address.toLowerCase() == "0x7D5f8F9560103E1ad958A6Ca43d49F954055340a".toLowerCase() && (
              <div className="row m-3">
                <div className="mx-auto text-center fw-bold" style={{ fontSize: '1.2em' }}>
                  {'  '} Please visit {' '}
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
                  Got Crosmocraft parts? {' '}
                  <a href="/build-ship">
                    <span className="color">build your Crosmocraft!</span>
                  </a>
                </div>
              </div>
            )}
            {collection.metadata.staking && (
              <div className="row">
                <div className="mx-auto text-center fw-bold" style={{ fontSize: '0.8em' }}>
                  NFTs from this collection can be staked at {' '}
                  <a href={stakingPlatforms[collection.metadata.staking].url} target="_blank" rel="noreferrer">
                    <span className="color">{stakingPlatforms[collection.metadata.staking].name}</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        )}
        <div className="row">
          <CollectionFilterBar showFilter={false} cacheName={cacheName} address={collection.address} traits={collectionStats?.traits} powertraits={collectionStats?.powertraits}/>
        </div>
        <div className="row">
          {(hasTraits() || hasPowertraits()) && (
            <div className="col-md-3 mb-4">
              {hasTraits() && <TraitsFilter address={collection.address} />}
              {hasPowertraits() && <PowertraitsFilter address={collection.address} />}
            </div>
          )}
          <div className={hasTraits() || hasPowertraits() ? 'col-md-9' : 'col-md-12'}>
            <CollectionListingsGroup listings={listings} canLoadMore={canLoadMore} loadMore={loadMore} />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Collection721;
