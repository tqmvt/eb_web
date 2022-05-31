import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Link from 'next/link';
// import { useRouter } from 'next/router';
import Blockies from 'react-blockies';
import { Contract, ethers } from 'ethers';
import { faCrow, faExternalLinkAlt, faHeart } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import MetaMaskOnboarding from '@metamask/onboarding';
import { Spinner } from 'react-bootstrap';
import ReactPlayer from 'react-player';

import ProfilePreview from '../components/ProfilePreview';
import Footer from '../components/Footer';
import LayeredIcon from '../components/LayeredIcon';
import {
  caseInsensitiveCompare,
  humanize,
  isBabyWeirdApesCollection,
  isCroCrowCollection,
  isCrognomidesCollection,
  isEvoSkullCollection,
  isNftBlacklisted,
  isUserBlacklisted,
  mapAttributeString,
  millisecondTimestamp,
  relativePrecision,
  shortAddress,
  timeSince,
} from '../../utils';
import { getNftDetails } from '../../GlobalState/nftSlice';
import { connectAccount, chainConnect } from '../../GlobalState/User';
import config from '../../Assets/networks/rpc_config.json';
import { croSkullRedPotionImageHack } from '../../hacks';
import ListingItem from '../NftDetails/NFTTabListings/ListingItem';
import PriceActionBar from '../NftDetails/PriceActionBar';
import { ERC721 } from '../../Contracts/Abis';
import { getFilteredOffers } from '../../core/subgraph';
import MakeOfferDialog from '../Offer/MakeOfferDialog';
import NFTTabOffers from '../Offer/NFTTabOffers';
import { OFFER_TYPE } from '../Offer/MadeOffersRow';
import { offerState } from '../../core/api/enums';
import { AnyMedia } from '../components/AnyMedia';

const knownContracts = config.known_contracts;

const Nft721 = ({ address, id, nft }) => {
  const dispatch = useDispatch();
  // const history = useRouter();

  const user = useSelector((state) => state.user);

  const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);
  const [offerType, setOfferType] = useState(OFFER_TYPE.none);
  const [offerData, setOfferData] = useState();

  // const nft = useSelector((state) => state.nft.nft);
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
  const [evoSkullTraits, setEvoSkullTraits] = useState([]);

  // useEffect(() => {
  //   dispatch(getNftDetails(address, id));
  // }, [dispatch, address, id]);

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

  useEffect(() => {
    async function getEvoSkullAttributes() {
      if (isEvoSkullCollection(address)) {
        const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
        const abiFile = require(`../../Assets/abis/evo-skull.json`);
        const contract = new Contract(address, abiFile, readProvider);
        try {
          const traits = await contract.getToken(id);
          const keyedTraits = Object.entries(traits.currentToken)
            .filter(([key]) => {
              return !/[^a-zA-Z]/.test(key);
            })
            .map(([key, value], i) => {
              let type = 'string';
              if (typeof value == 'boolean') {
                type = 'boolean';
                value = value ? 'yes' : 'no';
              } else if (key === 'lastClaimTimestamp') {
                type = 'date';
              } else if (key === 'lastActionBlock') {
                value = ethers.utils.commify(value);
              }
              return { key, value, type };
            });
          setEvoSkullTraits(keyedTraits);
        } catch (error) {
          console.log(error);
        }
      } else {
        setEvoSkullTraits(null);
      }
    }
    getEvoSkullAttributes();

    // eslint-disable-next-line
  }, [address]);

  const fullImage = () => {
    if (nft.original_image.startsWith('ipfs://')) {
      const link = nft.original_image.split('://')[1];
      return `https://ipfs.io/ipfs/${link}`;
    }

    return nft.original_image;
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
                      image={croSkullRedPotionImageHack(address, nft.image)}
                      video={nft.video ?? nft.animation_url}
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
                      window.open(croSkullRedPotionImageHack(address, fullImage()), '_blank')
                    }
                    className="d-flex align-items-center justify-content-center"
                  >
                    <span className="p-2">View Full Image</span>
                    <div style={{ width: '14px' }}>
                      <FontAwesomeIcon icon={faExternalLinkAlt} size="md" />
                    </div>
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
                        <PriceActionBar offerType={offerType} onOfferSelected={() => handleMakeOffer()} />
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
                        avatar={
                          collectionMetadata.rarity === 'rarity_sniper'
                            ? '/img/logos/rarity-sniper.png'
                            : '/img/logos/ebisu-technicolor.svg'
                        }
                        hover={
                          collectionMetadata.rarity === 'rarity_sniper'
                            ? `Ranking provided by ${humanize(collectionMetadata.rarity)}`
                            : "Ranking provided by Ebisu's Bay"
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
                    <ul className="de_nav nft_tabs_options">
                      <li id="Mainbtn0" className="tab active">
                        <span onClick={handleBtnClick(0)}>Details</span>
                      </li>
                      {((powertraits && powertraits.length > 0) || (evoSkullTraits && evoSkullTraits.length > 0)) && (
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
                                        <Trait
                                          key={i}
                                          title={data.trait_type}
                                          value={data.value}
                                          percent={data.percent}
                                          occurrence={data.occurrence}
                                          type={data.display_type}
                                          collectionAddress={address}
                                        />
                                      );
                                    })}
                                {nft.properties &&
                                  Array.isArray(nft.properties) &&
                                  nft.properties.map((data, i) => {
                                    return (
                                      <Trait
                                        key={i}
                                        title={data.trait_type}
                                        value={data.value}
                                        percent={data.percent}
                                        occurrence={data.occurrence}
                                        type={data.display_type}
                                        collectionAddress={address}
                                      />
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
                          {(powertraits && powertraits.length > 0) || (evoSkullTraits && evoSkullTraits.length > 0) ? (
                            <>
                              <div className="d-block mb-3">
                                <div className="row mt-5 gx-3 gy-2">
                                  {powertraits &&
                                    powertraits.length > 0 &&
                                    powertraits.map((data, i) => {
                                      return (
                                        <div key={i} className="col-lg-4 col-md-6 col-sm-6">
                                          <div className="nft_attr">
                                            <h5>{data.trait_type}</h5>
                                            <h4>{data.value > 0 ? <>+ {data.value}</> : <>{data.value}</>}</h4>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  {evoSkullTraits &&
                                    Array.isArray(evoSkullTraits) &&
                                    evoSkullTraits.map((data, i) => {
                                      return (
                                        <Trait
                                          key={i}
                                          title={data.key}
                                          value={data.value}
                                          type={data.type}
                                          collectionAddress={address}
                                        />
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
                        <div className="listing-tab tab-3 onStep fadeIn">
                          {listingHistory && listingHistory.length > 0 ? (
                            <>
                              {listingHistory.map((listing, index) => (
                                <ListingItem
                                  key={`sold-item-${index}`}
                                  route="/seller"
                                  primaryTitle="Bought by"
                                  user={listing.purchaser}
                                  time={timeSince(listing.saleTime + '000')}
                                  price={ethers.utils.commify(listing.price)}
                                  primaryText={shortAddress(listing.purchaser)}
                                />
                                /*<div className="p_list" key={index}>
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
                              </div>*/
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

const Trait = ({ title, value, percent, occurrence, type, collectionAddress }) => {
  return (
    <div className="col-lg-4 col-md-6 col-sm-6">
      <div className="nft_attr">
        <h5>{humanize(title)}</h5>
        <h4>
          {value !== undefined ? (
            <>
              {type === 'date' ? (
                <>{new Date(millisecondTimestamp(value)).toDateString()}</>
              ) : (
                <>{mapAttributeString(value, collectionAddress, true)}</>
              )}
            </>
          ) : (
            <>N/A</>
          )}
        </h4>
        {occurrence ? (
          <span>{Math.round(occurrence * 100)}% have this trait</span>
        ) : (
          percent && <span>{percent}% have this trait</span>
        )}
      </div>
    </div>
  );
};
