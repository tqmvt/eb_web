import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { Spinner } from 'react-bootstrap';
import Blockies from 'react-blockies';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import { getAuctionDetails } from '../../GlobalState/auctionSlice';
import { caseInsensitiveCompare, humanize, newlineText, shortAddress, timeSince } from '../../utils';
import BuyerActionBar from '../Auctions/BuyerActionBar';
import ProfilePreview from '../components/ProfilePreview';
import { appConfig } from '../../Config';
import { hostedImage } from '../../helpers/image';

const config = appConfig();
const knownContracts = config.collections;

const AuctionComponent = (props) => {
  const router = useRouter();
  const { id } = props;
  const dispatch = useDispatch();

  const listing = useSelector((state) => state.auction.auction);
  const bidHistory = useSelector((state) => state.auction.bidHistory);
  const powertraits = useSelector((state) => state.auction.powertraits);
  const isLoading = useSelector((state) => state.auction.loading);

  const collection = useSelector((state) => {
    return knownContracts.find((c) => c.address.toLowerCase() === listing?.nftAddress.toLowerCase());
  });

  useEffect(() => {
    dispatch(getAuctionDetails(id));
  }, [dispatch, id]);

  const fullImage = () => {
    if (listing.nft.original_image.startsWith('ipfs://')) {
      const link = listing.nft.original_image.split('://')[1];
      return `https://ipfs.io/ipfs/${link}`;
    }

    if (listing.nft.original_image.startsWith('https://gateway.ebisusbay.com')) {
      const link = listing.nft.original_image.replace('gateway.ebisusbay.com', 'ipfs.io');
      return link;
    }

    return listing.nft.original_image;
  };

  const [openMenu, setOpenMenu] = React.useState(0);
  const handleBtnClick = (index) => (element) => {
    var elements = document.querySelectorAll('.tab');
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
    }
    element.target.parentElement.classList.add('active');

    setOpenMenu(index);
  };

  return (
    <>
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
            <div className="row mt-md-5 pt-md-4">
              <div className="col-md-6 text-center">
                {listing && (
                  <>
                    <img src={listing.nft.image} className="img-fluid img-rounded mb-sm-30" alt={listing.nft.name} />
                    {listing.nft.original_image && (
                      <div className="nft__item_action mt-2" style={{ cursor: 'pointer' }}>
                        <span onClick={() => window.open(fullImage(), '_blank')}>
                          <span className="p-2">View Full Image</span>
                          <FontAwesomeIcon icon={faExternalLinkAlt} />
                        </span>
                      </div>
                    )}
                  </>
                )}
              </div>
              <div className="col-md-6">
                {listing && (
                  <div className="item_info">
                    <h2>{listing.nft.name}</h2>
                    <p>{listing.nft.description}</p>
                    <div className="row">
                      <BuyerActionBar />
                    </div>
                    <div className="row" style={{ gap: '2rem 0' }}>
                      <ProfilePreview type="Seller" address={listing.seller} to={`/seller/${listing.seller}`} />
                      <ProfilePreview
                        type="Collection"
                        title={collection.name}
                        avatar={hostedImage(collection.metadata.avatar, true)}
                        address={listing.nftAddress}
                        verified={collection.metadata.verified}
                        to={`/collection/${collection.slug}`}
                      />
                    </div>

                    <div className="spacer-40"></div>

                    <div className="de_tab">
                      <ul className="de_nav">
                        <li id="Mainbtn0" className="tab active">
                          <span onClick={handleBtnClick(0)}>Details</span>
                        </li>
                        {powertraits && powertraits.length > 0 && (
                          <li id="Mainbtn1" className="tab">
                            <span onClick={handleBtnClick(1)}>In-Game Attributes</span>
                          </li>
                        )}
                        <li id="Mainbtn2" className="tab">
                          <span onClick={handleBtnClick(2)}>Bids</span>
                        </li>
                        <li id="Mainbtn3" className="tab">
                          <span onClick={handleBtnClick(3)}>How to Bid</span>
                        </li>
                      </ul>

                      <div className="de_tab_content">
                        {openMenu === 0 && (
                          <div className="tab-1 onStep fadeIn">
                            {listing.nft.attributes && listing.nft.attributes.length > 0 ? (
                              <div key="charity-attributes">
                                <div className="d-block mb-3">
                                  <div className="row mt-5 gx-3 gy-2">
                                    {listing.nft.attributes.map((data, i) => {
                                      return (
                                        <div key={i} className="col-lg-4 col-md-6 col-sm-6">
                                          <div className="nft_attr">
                                            <h5>{humanize(data.trait_type)}</h5>
                                            <h4>{humanize(data.value)}</h4>
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
                              </div>
                            ) : (
                              <>
                                <span>No traits found for this item</span>
                              </>
                            )}
                          </div>
                        )}
                        {openMenu === 1 && (
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
                        {openMenu === 2 && (
                          <div className="tab-3 onStep fadeIn">
                            {bidHistory && bidHistory.length > 0 ? (
                              <>
                                {bidHistory.map((item, index) => (
                                  <div className="p_list" key={index}>
                                    <Link href={`/seller/${item.bidder}`}>
                                      <a>
                                        <div className="p_list_pp">
                                          <span>
                                            <span>
                                              <Blockies seed={item.bidder} size={10} scale={5} />
                                            </span>
                                          </span>
                                        </div>
                                      </a>
                                    </Link>
                                    <div className="p_list_info">
                                      <b>
                                        <Link href={`/seller/${item.bidder}`}>
                                          <a>{shortAddress(item.bidder)}</a>
                                        </Link>
                                      </b>{' '}
                                      bid <b>{ethers.utils.commify(item.price)} MAD</b>
                                    </div>
                                  </div>
                                ))}
                              </>
                            ) : (
                              <>
                                <span>No bids have been placed yet</span>
                              </>
                            )}
                          </div>
                        )}
                        {openMenu === 3 && (
                          <div className="tab-4 onStep fadeIn">
                            <h4>How it works:</h4>
                            <ol>
                              <li>
                                Connect your wallet and place a bid. Minimum bid will change depending on the current
                                price
                              </li>
                              <ul>
                                <li>
                                  When current price is 0-99 $MAD, minimum increment is{' '}
                                  <span className="fw-bold">5 $MAD</span>
                                </li>
                                <li>
                                  When current price is 100-499 $MAD, minimum increment is{' '}
                                  <span className="fw-bold">10 $MAD</span>
                                </li>
                                <li>
                                  When current price is 500-999 $MAD, minimum increment is{' '}
                                  <span className="fw-bold">50 $MAD</span>
                                </li>
                                <li>
                                  When current price is 1000+ $MAD, minimum increment is{' '}
                                  <span className="fw-bold">100 $MAD</span>
                                </li>
                              </ul>
                              <li>If you are outbid, you can either bid higher, or cancel your current bid</li>
                              <li>
                                If a bid is received 15 minutes from the end of the auction, the bidding time will be
                                extended by 15 minutes
                              </li>
                              <li>
                                When auction closes, the NFT will belong to the highest bidder. Please claim the NFT by
                                pressing the "Accept Auction" button
                              </li>
                            </ol>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        )}
      </div>
    </>
  );
};

export default memo(AuctionComponent);
