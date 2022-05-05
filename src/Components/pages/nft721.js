import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, Link } from 'react-router-dom';
import Blockies from 'react-blockies';
import { Contract, ethers } from 'ethers';
import { faCrow, faExternalLinkAlt, faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Helmet } from 'react-helmet';
import MetaMaskOnboarding from '@metamask/onboarding';

import ProfilePreview from '../components/ProfilePreview';
import Footer from '../components/Footer';
import {
  caseInsensitiveCompare,
  humanize,
  isBabyWeirdApesCollection,
  isCroCrowCollection,
  isCrognomidesCollection,
  isNftBlacklisted,
  isUserBlacklisted,
  relativePrecision,
  shortAddress,
  timeSince,
} from '../../utils';
import { getNftDetails } from '../../GlobalState/nftSlice';
import config from '../../Assets/networks/rpc_config.json';
import { croSkullRedPotionImageHack } from '../../hacks';
import NFTTabOffers from '../Offer/NFTTabOffers';
import PriceActionBar from '../NftDetails/PriceActionBar';
import MakeOfferDialog from '../Offer/MakeOfferDialog';
import { connectAccount, chainConnect } from 'src/GlobalState/User';
import { Spinner } from 'react-bootstrap';

import ReactPlayer from 'react-player';
import LayeredIcon from '../components/LayeredIcon';
import { ERC721 } from '../../Contracts/Abis';
import { getFilteredOffers } from 'src/core/subgraph';
import { OFFER_TYPE } from '../Offer/MadeOffersRow';
import { offerState } from '../../core/api/enums';

const knownContracts = config.known_contracts;

const Nft721 = ({ address, id }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const user = useSelector((state) => state.user);

  const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);
  const [offerType, setOfferType] = useState(OFFER_TYPE.none);
  const [offerData, setOfferData] = useState();

  const nft = useSelector((state) => state.nft.nft);
  const currentListing = useSelector((state) => state.nft.currentListing);
  const listingHistory = useSelector((state) =>
    state.nft.history.filter((i) => i.state === 1).sort((a, b) => (a.saleTime < b.saleTime ? 1 : -1))
  );

  const powertraits = useSelector((state) => state.nft.nft?.powertraits);
  const collection = useSelector((state) => {
    return knownContracts.find((c) => caseInsensitiveCompare(c.address, address));
  });
  const collectionMetadata = useSelector((state) => {
    return collection?.metadata;
  });
  const collectionName = useSelector((state) => {
    return collection?.name;
  });
  const isLoading = useSelector((state) => state.nft.loading);

  // Custom breeding considerations
  const [croCrowBreed, setCroCrowBreed] = useState(null);
  const [crognomideBreed, setCrognomideBreed] = useState(null);
  const [babyWeirdApeBreed, setBabyWeirdApeBreed] = useState(null);

  useEffect(() => {
    dispatch(getNftDetails(address, id));
  }, [dispatch, address, id]);

  useEffect(() => {
    async function asyncFunc() {
      if (isCroCrowCollection(address) && croCrowBreed === null) {
        const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
        const crowpunkContract = new Contract(
          '0x0f1439a290e86a38157831fe27a3dcd302904055',
          [
            'function availableCrows(address _owner) public view returns (uint256[] memory, bool[] memory)',
            'function isCrowUsed(uint256 tokenId) public view returns (bool)',
          ],
          readProvider
        );
        const croCrowContract = new Contract('0xE4ab77ED89528d90E6bcf0E1Ac99C58Da24e79d5', ERC721, readProvider);
        try {
          if (parseInt(id) < 3500) {
            const used = await crowpunkContract.isCrowUsed(id);
            setCroCrowBreed(used);
          } else {
            const ownerAddress = await croCrowContract.ownerOf(id);
            const crows = await crowpunkContract.availableCrows(ownerAddress);
            for (const [i, o] of crows[0].entries()) {
              if (o.toNumber() === parseInt(id)) {
                setCroCrowBreed(crows[1][i]);
                return;
              }
            }
          }
        } catch (error) {
          console.log(error);
        }
      } else {
        setCroCrowBreed(null);
      }
    }

    asyncFunc();

    // eslint-disable-next-line
  }, [address]);

  useEffect(() => {
    async function getCrognomid() {
      if (isCrognomidesCollection(address) && crognomideBreed === null) {
        const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
        const contract = new Contract(
          '0xE57742748f98ab8e08b565160D3A9A32BFEF7352',
          ['function crognomidUsed(uint256) public view returns (bool)'],
          readProvider
        );
        try {
          const used = await contract.crognomidUsed(id);
          setCrognomideBreed(used);
        } catch (error) {
          console.log(error);
        }
      } else {
        setCrognomideBreed(null);
      }
    }
    getCrognomid();

    // eslint-disable-next-line
  }, [address]);

  useEffect(() => {
    async function getApeInfo() {
      if (isBabyWeirdApesCollection(address)) {
        const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
        const abiFile = require(`../../Assets/abis/baby-weird-apes.json`);
        const contract = new Contract(address, abiFile.abi, readProvider);
        try {
          const apeInfo = await contract.apeInfo(id);
          setBabyWeirdApeBreed(apeInfo);
        } catch (error) {
          console.log(error);
        }
      } else {
        setBabyWeirdApeBreed(null);
      }
    }
    getApeInfo();

    // eslint-disable-next-line
  }, [address]);

  const viewSeller = (seller) => () => {
    history.push(`/seller/${seller}`);
  };

  const fullImage = () => {
    if (nft.original_image.startsWith('ipfs://')) {
      const link = nft.original_image.split('://')[1];
      return `https://ipfs.io/ipfs/${link}`;
    }

    return nft.original_image;
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
  }, [nft, user]);

  return (
    <div>
      <Helmet>
        <title>{nft?.name || 'NFT'} | Ebisu's Bay Marketplace</title>
        <meta name="description" content={`${nft?.name || 'NFT'} for Ebisu's Bay Marketplace`} />
        <meta name="title" content={`${nft?.name || 'NFT'} | Ebisu's Bay Marketplace`} />
        <meta property="og:title" content={`${nft?.name || 'NFT'} | Ebisu's Bay Marketplace`} />
        <meta property="og:url" content={`https://app.ebisusbay.com/nft/${address}`} />
        <meta property="og:image" content={nft?.image} />
        <meta name="twitter:title" content={`${nft?.name || 'NFT'} | Ebisu's Bay Marketplace`} />
        <meta name="twitter:image" content={nft?.image} />
      </Helmet>
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
              {nft ? (
                nft.useIframe ? (
                  <iframe width="100%" height="636" src={nft.iframeSource} title="nft" />
                ) : (
                  <>
                    {nft.video ? (
                      <ReactPlayer
                        controls={true}
                        url={nft.video}
                        config={{
                          file: {
                            attributes: {
                              onContextMenu: (e) => e.preventDefault(),
                              controlsList: 'nodownload',
                            },
                          },
                        }}
                        muted={true}
                        playing={true}
                        loop={true}
                        width="100%"
                        height="auto"
                      />
                    ) : (
                      <img
                        src={croSkullRedPotionImageHack(address, nft.image)}
                        className="img-fluid img-rounded mb-sm-30"
                        alt={nft.name}
                      />
                    )}
                  </>
                )
              ) : (
                <></>
              )}
              {nft && nft.original_image && (
                <div className="nft__item_action mt-2" style={{ cursor: 'pointer' }}>
                  <span onClick={() => window.open(croSkullRedPotionImageHack(address, fullImage()), '_blank')}>
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
                  <p>{nft.description}</p>
                  {isCroCrowCollection(address) && croCrowBreed && (
                    <div className="d-flex flex-row align-items-center mb-4">
                      <LayeredIcon
                        icon={faCrow}
                        bgColor={'#ed7a11'}
                        color={'#000'}
                        inverse={false}
                        title="This crow has been bred to create a CrowPunk!"
                      />
                      <span className="fw-bold">This CRO Crow has been bred for a CrowPunk</span>
                    </div>
                  )}
                  {isCrognomidesCollection(address) && crognomideBreed && (
                    <div className="d-flex flex-row align-items-center mb-4">
                      <LayeredIcon
                        icon={faHeart}
                        bgColor={'#fff'}
                        color={'#dc143c'}
                        inverse={false}
                        title="This Crognomide has been bred for a Croby!"
                      />
                      <span className="fw-bold">This Crognomide has been bred for a Croby</span>
                    </div>
                  )}

                  {collection.listable &&
                    (!currentListing || !isUserBlacklisted(currentListing.seller)) &&
                    !isNftBlacklisted(address, id) && (
                      <>
                        <PriceActionBar />
                        <div className="row">
                          <button className="btn-main mx-auto mb-5" onClick={() => handleMakeOffer()}>
                            {offerType === OFFER_TYPE.update ? 'Update' : 'Make'} Offer
                          </button>
                        </div>
                      </>
                    )}

                  <div className="row" style={{ gap: '2rem 0' }}>
                    {currentListing && (
                      <ProfilePreview
                        type="Seller"
                        address={currentListing.seller}
                        to={`/seller/${currentListing.seller}`}
                      />
                    )}

                    <ProfilePreview
                      type="Collection"
                      title={collectionName ?? 'View Collection'}
                      avatar={collectionMetadata?.avatar}
                      address={address}
                      verified={collectionMetadata?.verified}
                      to={`/collection/${address}`}
                    />

                    {typeof nft.rank !== 'undefined' && nft.rank !== null && (
                      <ProfilePreview
                        type="Rarity Rank"
                        title={nft.rank}
                        avatar={collectionMetadata.rarity === 'rarity_sniper' ? '/img/logos/rarity-sniper.png' : null}
                        hover={
                          collectionMetadata.rarity === 'rarity_sniper'
                            ? `Ranking provided by ${humanize(collectionMetadata.rarity)}`
                            : null
                        }
                        to={
                          collectionMetadata.rarity === 'rarity_sniper'
                            ? `https://raritysniper.com/${collectionMetadata.raritySniperSlug}/${id}`
                            : null
                        }
                        pop={true}
                      />
                    )}
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
                        <span onClick={handleBtnClick(2)}>History</span>
                      </li>
                      <li id="Mainbtn3" className="tab">
                        <span onClick={handleBtnClick(3)}>Offers</span>
                      </li>
                      {babyWeirdApeBreed && (
                        <li id="Mainbtn9" className="tab">
                          <span onClick={handleBtnClick(9)}>Breed Info</span>
                        </li>
                      )}
                    </ul>

                    <div className="de_tab_content">
                      {openMenu === 0 && (
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
                                                    <>{(new Date(data.value * 1000)).toDateString()}</>
                                                  ) : (
                                                    <>{humanize(data.value)}</>
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
                                                  <>{(new Date(data.value * 1000)).toDateString()}</>
                                                ) : (
                                                  <>{humanize(data.value)}</>
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
                          {listingHistory && listingHistory.length > 0 ? (
                            <>
                              {listingHistory.map((listing, index) => (
                                <div className="p_list" key={index}>
                                  <Link to={`/seller/${listing.purchaser}`}>
                                    <div className="p_list_pp">
                                      <span>
                                        <span onClick={viewSeller(listing.purchaser)}>
                                          <Blockies seed={listing.purchaser} size={10} scale={5} />
                                        </span>
                                      </span>
                                    </div>
                                  </Link>
                                  <div className="p_list_info">
                                    <span>{timeSince(listing.saleTime + '000')} ago</span>
                                    Bought by{' '}
                                    <b>
                                      <Link to={`/seller/${listing.purchaser}`}>{shortAddress(listing.purchaser)}</Link>
                                    </b>{' '}
                                    for <b>{ethers.utils.commify(listing.price)} CRO</b>
                                  </div>
                                </div>
                              ))}
                            </>
                          ) : (
                            <>
                              <span>No history found for this item</span>
                            </>
                          )}
                        </div>
                      )}

                      {openMenu === 3 && <NFTTabOffers nftAddress={address} nftId={id} />}

                      {openMenu === 9 && babyWeirdApeBreed && (
                        <div className="tab-2 onStep fadeIn">
                          <div className="d-block mb-3">
                            <div className="row mt-5 gx-3 gy-2">
                              {babyWeirdApeBreed.breedStatus ? (
                                <div key={0} className="col-lg-4 col-md-6 col-sm-6">
                                  <div className="nft_attr">
                                    <h5>Birthdate</h5>
                                    {babyWeirdApeBreed.birthdate.gt(0) ? (
                                      <h4>
                                        {new Date(babyWeirdApeBreed.birthdate.toNumber() * 1000).toLocaleDateString()}
                                      </h4>
                                    ) : (
                                      <h4>Unknown</h4>
                                    )}
                                  </div>
                                </div>
                              ) : (
                                <div key={0} className="col-lg-4 col-md-6 col-sm-6">
                                  <div className="nft_attr">
                                    <h5>Incubator ID</h5>
                                    <h4>{id}</h4>
                                  </div>
                                </div>
                              )}
                              <div key={1} className="col-lg-4 col-md-6 col-sm-6">
                                <div className="nft_attr">
                                  <h5>Mother ID</h5>
                                  <h4>{babyWeirdApeBreed.mother.toNumber()}</h4>
                                </div>
                              </div>
                              <div key={2} className="col-lg-4 col-md-6 col-sm-6">
                                <div className="nft_attr">
                                  <h5>Father ID</h5>
                                  <h4>
                                    <a href={`/collection/weird-apes-club-v2/${babyWeirdApeBreed.father.toNumber()}`}>
                                      {babyWeirdApeBreed.father.toNumber()}
                                    </a>
                                  </h4>
                                </div>
                              </div>
                            </div>
                          </div>
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

export default memo(Nft721);
