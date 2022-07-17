import React, {memo, useCallback, useEffect, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Spinner } from 'react-bootstrap';
import MetaMaskOnboarding from '@metamask/onboarding';

import ProfilePreview from '../components/ProfilePreview';
import Footer from '../components/Footer';
import {
  findCollectionByAddress,
  humanize,
  isCrosmocraftsPartsDrop,
  mapAttributeString,
  millisecondTimestamp, rankingsLinkForCollection, rankingsLogoForCollection, rankingsTitleForCollection,
  relativePrecision,
  shortAddress,
  timeSince,
} from '../../utils';
import { getNftDetails } from '../../GlobalState/nftSlice';
import { specialImageTransform } from '../../hacks';
import { chainConnect, connectAccount } from '../../GlobalState/User';

import ListingItem from '../NftDetails/NFTTabListings/ListingItem';
import { listingState, offerState } from '../../core/api/enums';
import { getFilteredOffers } from '../../core/subgraph';
import PriceActionBar from '../NftDetails/PriceActionBar';
import NFTTabListings from '../NftDetails/NFTTabListings';
import MakeOfferDialog from '../Offer/MakeOfferDialog';
import { OFFER_TYPE } from '../Offer/MadeOffersRow';
import NFTTabOffers from '../Offer/NFTTabOffers';
import { AnyMedia } from '../components/AnyMedia';
import { hostedImage } from '../../helpers/image';

const tabs = {
  details: 'details',
  powertraits: 'powertraits',
  history: 'history',
  listings: 'listings',
  offers: 'offers',
};

const Nft1155 = ({ address, id }) => {
  const dispatch = useDispatch();
  const history = useRouter();

  const nft = useSelector((state) => state.nft.nft);
  const soldListings = useSelector((state) =>
    state.nft.history.filter((i) => i.state === listingState.SOLD).sort((a, b) => (a.saleTime < b.saleTime ? 1 : -1))
  );
  const activeListings = useSelector((state) =>
    state.nft.history.filter((i) => i.state === listingState.ACTIVE).sort((a, b) => a.price - b.price)
  );

  const powertraits = useSelector((state) => state.nft.nft?.powertraits);
  const collection = useSelector((state) => {
    return findCollectionByAddress(address, id);
  });
  const collectionMetadata = useSelector((state) => {
    return collection?.metadata;
  });
  const collectionName = useSelector((state) => {
    return collection?.name;
  });
  const collectionSlug = useSelector((state) => {
    return collection?.slug;
  });
  const isLoading = useSelector((state) => state.nft.loading);
  const user = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(getNftDetails(address, id));
  }, [dispatch, address, id]);

  const fullImage = () => {
    if (nft.original_image.startsWith('ipfs://')) {
      const link = nft.original_image.split('://')[1];
      return `https://ipfs.io/ipfs/${link}`;
    }

    if (nft.original_image.startsWith('https://gateway.ebisusbay.com')) {
      const link = nft.original_image.replace('gateway.ebisusbay.com', 'ipfs.io');
      return link;
    }

    return nft.original_image;
  };

  const [currentTab, setCurrentTab] = useState(tabs.details);
  const handleTabChange = useCallback((tab) => {
    setCurrentTab(tab);
  }, []);

  const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);
  const [offerType, setOfferType] = useState(OFFER_TYPE.none);
  const [offerData, setOfferData] = useState();

  const handleMakeOffer = () => {
    if (user.address) {
      setOpenMakeOfferDialog(!openMakeOfferDialog);
    } else {
      if (user.needsOnboard) {
        const onboarding = new MetaMaskOnboarding();
        onboarding.startOnboarding();
      } else if (!user.address) {
        dispatch(connectAccount());
      } else if (!user.correctChain) {
        dispatch(chainConnect());
      }
    }
  };

  useEffect(() => {
    async function func() {
      const filteredOffers = await getFilteredOffers(nft.address, nft.id.toString(), user.address);
      const data = filteredOffers ? filteredOffers.data.filter((o) => o.state === offerState.ACTIVE.toString()) : [];
      if (data && data.length > 0) {
        setOfferType(OFFER_TYPE.update);
        setOfferData(data[0]);
      } else {
        setOfferType(OFFER_TYPE.make);
      }
    }
    if (!offerType && user.address && nft && nft.address && nft.id) {
      func();
    }

    // eslint-disable-next-line
  }, [nft, user.address]);

  return (
    <div>
      {isLoading ? (
        <section className="container">
          <div className="row mt-4">
            <div className="col-lg-12 text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </div>
        </section>
      ) : (
        <section className="container">
          <div className="row">
            <div className="col-md-6 text-center">
              {nft ? (
                nft.useIframe ? (
                  <iframe width="100%" height="636" src={nft.iframeSource} title="nft" />
                ) : (
                  <>
                    <AnyMedia
                      image={specialImageTransform(address, nft.image)}
                      video={specialImageTransform(address, nft.video ?? nft.animation_url)}
                      videoProps={{ height: 'auto', autoPlay: true }}
                      title={nft.name}
                      usePlaceholder={false}
                      className="img-fluid img-rounded mb-sm-30"
                    />
                  </>
                )
              ) : (
                <></>
              )}
              {nft && nft.original_image && (
                <div className="nft__item_action mt-2" style={{ cursor: 'pointer' }}>
                  <span
                    onClick={() =>
                      typeof window !== 'undefined' &&
                      window.open(specialImageTransform(address, fullImage()), '_blank')
                    }
                  >
                    <span className="p-2">View Full Image</span>
                    <FontAwesomeIcon icon={faExternalLinkAlt} />
                  </span>
                </div>
              )}
            </div>
            <div className="col-md-6">
              {nft && (
                <div className="item_info">
                  <h2>{nft.name}</h2>
                  <p className="text-break">{nft.description}</p>
                  {collection.listable && (
                    <>
                      <PriceActionBar
                        offerType={offerType}
                        onOfferSelected={() => handleMakeOffer()}
                        label="Floor Price"
                      />
                    </>
                  )}
                  <div className="row" style={{ gap: '2rem 0' }}>
                    <ProfilePreview
                      type="Collection"
                      title={collectionName ?? 'View Collection'}
                      avatar={hostedImage(collectionMetadata?.avatar, true)}
                      address={address}
                      verified={collectionMetadata?.verified}
                      to={`/collection/${collectionSlug}`}
                    />

                    {typeof nft.rank !== 'undefined' && nft.rank !== null && (
                      <ProfilePreview
                        type="Rarity Rank"
                        title={nft.rank}
                        avatar={rankingsLogoForCollection(collection)}
                        hover={rankingsTitleForCollection(collection)}
                        to={rankingsLinkForCollection(collection)}
                        pop={true}
                      />
                    )}
                  </div>

                  <div className="spacer-40"></div>

                  <div className="de_tab">
                    <ul className="de_nav nft_tabs_options">
                      <li className={`tab ${currentTab === tabs.details ? 'active' : ''}`}>
                        <span onClick={() => handleTabChange(tabs.details)}>Details</span>
                      </li>
                      {powertraits && powertraits.length > 0 && (
                        <li className={`tab ${currentTab === tabs.powertraits ? 'active' : ''}`}>
                          <span onClick={() => handleTabChange(tabs.powertraits)}>In-Game Attributes</span>
                        </li>
                      )}
                      <li className={`tab ${currentTab === tabs.history ? 'active' : ''}`}>
                        <span onClick={() => handleTabChange(tabs.history)}>History</span>
                      </li>
                      {collection.listable && (
                        <li className={`tab ${currentTab === tabs.listings ? 'active' : ''}`}>
                          <span onClick={() => handleTabChange(tabs.listings)}>Listings</span>
                        </li>
                      )}
                      <li className={`tab ${currentTab === tabs.offers ? 'active' : ''}`}>
                        <span onClick={() => handleTabChange(tabs.offers)}>Offers</span>
                      </li>
                    </ul>

                    <div className="de_tab_content">
                      {currentTab === tabs.details && (
                        <div className="tab-1 onStep fadeIn">
                          {(nft.attributes && Array.isArray(nft.attributes) && nft.attributes.length > 0) ||
                          (nft.properties && Array.isArray(nft.properties) && nft.properties.length > 0) ? (
                            <div className="d-block mb-3">
                              <div className="row mt-5 gx-3 gy-2">
                                {nft.attributes &&
                                  Array.isArray(nft.attributes) &&
                                  nft.attributes
                                    .filter((a) => a.value !== 'None')
                                    .map((data, i) => {
                                      return (
                                        <div key={i} className="col-lg-4 col-md-6 col-sm-6">
                                          <div className="nft_attr">
                                            <h5>{humanize(data.trait_type)}</h5>
                                            <h4>
                                              {data.value !== undefined ? (
                                                <>
                                                  {data?.display_type === 'date' ? (
                                                    <>{new Date(millisecondTimestamp(data.value)).toDateString()}</>
                                                  ) : (
                                                    <>{mapAttributeString(data.value, address, true)}</>
                                                  )}
                                                </>
                                              ) : (
                                                <>N/A</>
                                              )}
                                            </h4>
                                            {data.occurrence ? (
                                              <span>{relativePrecision(data.occurrence)}% have this trait</span>
                                            ) : (
                                              data.percent && <span>{data.percent}% have this trait</span>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                {nft.properties &&
                                  Array.isArray(nft.properties) &&
                                  nft.properties.map((data, i) => {
                                    return (
                                      <div key={i} className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="nft_attr">
                                          <h5>{humanize(data.trait_type)}</h5>
                                          <h4>
                                            {data.value !== undefined ? (
                                              <>
                                                {data?.display_type === 'date' ? (
                                                  <>{new Date(millisecondTimestamp(data.value)).toDateString()}</>
                                                ) : (
                                                  <>
                                                    {mapAttributeString(
                                                      isCrosmocraftsPartsDrop(address) ? data.Value : data.value,
                                                      address,
                                                      true
                                                    )}
                                                  </>
                                                )}
                                              </>
                                            ) : (
                                              <>N/A</>
                                            )}
                                          </h4>
                                          {data.occurrence ? (
                                            <span>{Math.round(data.occurrence * 100)}% have this trait</span>
                                          ) : (
                                            data.percent && <span>{data.percent}% have this trait</span>
                                          )}
                                        </div>
                                      </div>
                                    );
                                  })}
                              </div>
                            </div>
                          ) : (
                            <>
                              <span>No traits found for this item</span>
                            </>
                          )}
                        </div>
                      )}
                      {currentTab === tabs.powertraits && (
                        <div className="tab-2 onStep fadeIn">
                          {powertraits && powertraits.length > 0 ? (
                            <>
                              <div className="d-block mb-3">
                                <div className="row mt-5 gx-3 gy-2">
                                  {powertraits.map((data, i) => {
                                    return (
                                      <div key={i} className="col-lg-4 col-md-6 col-sm-6">
                                        <div className="nft_attr">
                                          <h5>{data.trait_type}</h5>
                                          <h4>{data.value > 0 ? <>+ {data.value}</> : <>{data.value}</>}</h4>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            </>
                          ) : (
                            <>
                              <span>No in-game attributes found for this item</span>
                            </>
                          )}
                        </div>
                      )}
                      {currentTab === tabs.history && (
                        <div className="listing-tab tab-3 onStep fadeIn">
                          {soldListings && soldListings.length > 0 ? (
                            <>
                              {soldListings.map((listing, index) => (
                                <ListingItem
                                  key={`sold-item-${index}`}
                                  route="/seller"
                                  primaryTitle="Bought by"
                                  user={listing.purchaser}
                                  time={timeSince(listing.saleTime + '000')}
                                  price={ethers.utils.commify(listing.price)}
                                  primaryText={shortAddress(listing.purchaser)}
                                />
                                /*
                                <div className="p_list" key={index}>
                                  <Link href={`/seller/${listing.purchaser}`}>
                                    <a>
                                      <div className="p_list_pp">
                                        <span>
                                          <span onClick={viewSeller(listing.purchaser)}>
                                            <Blockies seed={listing.purchaser} size={10} scale={5} />
                                          </span>
                                        </span>
                                      </div>
                                    </a>
                                  </Link>
                                  <div className="p_list_info">
                                    <span>{timeSince(listing.saleTime + '000')} ago</span>
                                    Bought by{' '}
                                    <b>
                                      <Link href={`/seller/${listing.purchaser}`}>
                                        <a>{shortAddress(listing.purchaser)}</a>
                                      </Link>
                                    </b>{' '}
                                    for <b>{ethers.utils.commify(listing.price)} CRO</b>
                                  </div>
                                </div>
*/
                              ))}
                            </>
                          ) : (
                            <>
                              <span>No history found for this item</span>
                            </>
                          )}
                        </div>
                      )}
                      {currentTab === tabs.listings && (
                        <div className="tab-3 onStep fadeIn">
                          <NFTTabListings listings={activeListings} />
                        </div>
                      )}
                      {currentTab === tabs.offers && <NFTTabOffers nftAddress={address} nftId={id} />}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      )}
      {openMakeOfferDialog && (
        <MakeOfferDialog
          isOpen={openMakeOfferDialog}
          toggle={() => setOpenMakeOfferDialog(!openMakeOfferDialog)}
          offerData={offerData}
          nftData={nft}
          collectionMetadata={collectionMetadata}
          type={offerType}
        />
      )}
      <Footer />
    </div>
  );
};

export default memo(Nft1155);
