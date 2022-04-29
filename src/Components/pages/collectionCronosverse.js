import React, {useEffect, useRef, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Contract, ethers } from 'ethers';
import Blockies from 'react-blockies';
import { Helmet } from 'react-helmet';
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import { Spinner } from 'react-bootstrap';
// import Skeleton from 'react-loading-skeleton';
// import 'react-loading-skeleton/dist/skeleton.css';

// import CollectionListingsGroup from '../components/CollectionListingsGroup';
import CollectionFilterBar from '../components/CollectionFilterBar';
import LayeredIcon from '../components/LayeredIcon';
import Footer from '../components/Footer';
import CollectionInfoBar from '../components/CollectionInfoBar';
import { init, fetchListings, getStats } from '../../GlobalState/collectionSlice';
import {caseInsensitiveCompare, createSuccessfulTransactionToastContent, isCrosmocraftsCollection} from '../../utils';
import TraitsFilter from '../Collection/TraitsFilter';
import PowertraitsFilter from '../Collection/PowertraitsFilter';
import SocialsBar from '../Collection/SocialsBar';
import { CollectionSortOption } from '../Models/collection-sort-option.model';
import { FilterOption } from '../Models/filter-option.model';
import config from '../../Assets/networks/rpc_config.json';
import Market from '../../Contracts/Marketplace.json';
import stakingPlatforms from '../../core/data/staking-platforms.json';
import SalesCollection from '../components/SalesCollection';
import CollectionNftsGroup from '../components/CollectionNftsGroup';
import CollectionListingsGroup from '../components/CollectionListingsGroup';
import {TransformComponent, TransformWrapper} from "react-zoom-pan-pinch";
import borderboard from "../../Assets/cronosverse/border_board.png";
import tile1 from "../../Assets/cronosverse/Plain-tile.png";
import tile2 from "../../Assets/cronosverse/Suburban-tile.png";
import tile3 from "../../Assets/cronosverse/Commercial-tile.png";
import Button from "../components/Button";
import styled from "styled-components";
import {toast} from "react-toastify";
import {getAnalytics, logEvent} from "@firebase/analytics";
import * as Sentry from "@sentry/react";
import {chainConnect, connectAccount} from "../../GlobalState/User";
import MetaMaskOnboarding from "@metamask/onboarding";
import MakeOfferDialog from "../Offer/MakeOfferDialog";
import {useHistory} from "react-router-dom";
import {commify} from "ethers/lib/utils";

const knownContracts = config.known_contracts;

const CollectionCronosverse = ({ collection }) => {
  const dispatch = useDispatch();
  const history = useHistory();

  const user = useSelector((state) => state.user);
  const items = useSelector((state) => state.collection.listings);
  const listings = useSelector((state) => state.collection.listings.filter((item) => item.market.id));

  const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);
  const [nftOffer, setNftOffer] = useState(null);

  useEffect(() => {
    const filterOption = FilterOption.default();
    filterOption.type = 'collection';
    filterOption.address = collection.address;
    dispatch(
      init(
        filterOption,
        CollectionSortOption.default(),
        {},
        collection.address
      )
    );
    dispatch(fetchListings());
    // eslint-disable-next-line
  }, [dispatch]);

  useEffect(() => {
    console.log(items.map(i=>i.market));
    console.log(listings);
  }, [items]);

  const handleMakeOffer = (nft) => {
    console.log('handleMakeOffer', nft);
    if (user.address) {
      setNftOffer(nft);
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

  const handleBuy = (listing) => {
    console.log('handleBuy', listing);
    // if (listing.market?.id) {
    //   history.push(`/listing/${listing.market?.id}`);
    // } else {
    history.push(`/collection/${listing.address}/${listing.id}`);
    // }
  };

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
                  {collection.metadata.description && <p>{collection.metadata.description}</p>}
                  <span className="fs-4">
                    <SocialsBar
                      collection={knownContracts.find((c) => caseInsensitiveCompare(c.address, collection.address))}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="overflow-auto">
        <CronosverseCollectionBoard
          onBuy={handleBuy}
          onOffer={handleMakeOffer}
          minting={false}
          listings={listings}
          nfts={items}
        />
      </section>
      <Footer />

      {openMakeOfferDialog && (
        <MakeOfferDialog
          isOpen={openMakeOfferDialog}
          toggle={() => setOpenMakeOfferDialog(!openMakeOfferDialog)}
          nftData={nftOffer}
        />
      )}
    </div>
  );
};
export default CollectionCronosverse;


const MakeOffer = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;

  .w-45 {
    width: 45%;
  }
`;

const tiles = [tile1, tile2, tile3];
const tileType = ['Plain', 'Suburban', 'Commercial'];

const CronosverseCollectionBoard = ({ onBuy, onOffer, minting, listings = [], nfts = [] }) => {
  const ref0 = useRef();
  const ref2 = useRef();
  const [tileInfo, setTileInfo] = useState({});
  const [modalFlag, setModalFlag] = useState('none');
  const [canvasDown, setCanvasDown] = useState(false);
  const [zoomState, setZoomState] = useState({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const [isMintingFlag, setIsMintingFlag] = useState(false);

  const [tempWidth, setTempWidth] = useState(1);
  const [tempHeight, setTempHeight] = useState(1);
  // const previousX = useRef()
  // const previousY = useRef()

  const [subDistance, setSubDistance] = useState(0);
  let sub = 0;
  const getTileType = (xPos, yPos) => {
    if (yPos >= 9 && xPos >= 19 && yPos <= 17 && xPos <= 34) {
      return 4;
    } else if (yPos >= 7 && xPos >= 17 && yPos <= 19 && xPos <= 36) {
      return 3;
    } else if (yPos >= 4 && xPos >= 12 && yPos <= 22 && xPos <= 41) {
      return 2;
    } else if (yPos === 0 || xPos === 0 || yPos === 27 || xPos === 53) {
      return 0;
    } else {
      return 1;
    }
  };

  const getTokenId = (j, i) => {
    let id;
    let temp = 52 * (i - 1) + j;
    if (i <= 8 || (i === 9 && j <= 18)) {
      id = temp;
      return id;
    }
    if (i >= 9 && i <= 16 && j >= 35) {
      id = temp - (i - 8) * 16;
      return id;
    }
    if (i >= 10 && i <= 17 && j <= 18) {
      id = temp - (i - 9) * 16;
      return id;
    }
    if ((i >= 18 && i < 27) || (i >= 17 && j >= 35)) {
      id = temp - 16 * 9;
      return id;
    }
  };

  const getPosFromTokenId = (tokenId) => {
    if (tokenId >= 1 && tokenId <= 434) {
      return [((tokenId - 1) % 52) + 1, Math.floor((tokenId - 1) / 52) + 1];
    }
    if (tokenId >= 435 && tokenId <= 722) {
      const tId = Math.floor((tokenId - 435) / 36) * 16 + 16 + tokenId;
      return [((tId - 1) % 52) + 1, Math.floor((tId - 1) / 52) + 1];
    }
    if (tokenId >= 723 && tokenId <= 1208) {
      const tId = tokenId + 144;
      return [((tId - 1) % 52) + 1, Math.floor((tId - 1) / 52) + 1];
    }
    return [0, 0];
  };

  const listingForToken = (tokenId) => {
    return listings.find((listing) => tokenId == listing.id);
  };

  const nftForToken = (tokenId) => {
    return nfts.find((nft) => tokenId == nft.id);
  };

  const changeCanvasState = (ReactZoomPanPinchRef, event) => {
    setZoomState({
      offsetX: ReactZoomPanPinchRef.state.positionX,
      offsetY: ReactZoomPanPinchRef.state.positionY,
      scale: ReactZoomPanPinchRef.state.scale,
    });
  };

  const getMousePos = (e) => {
    var rect = e.target.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleClick = (e) => {
    if (isMintingFlag) {
      return;
    }
    console.log('click: ');
    if (subDistance > 0) {
      console.log('too right: ', sub);
    }
    const mPos = getMousePos(e);
    let scale = zoomState.scale;
    const tileWidth = ref2.current.width / 54;
    const tileHeight = ref2.current.height / 28;
    const xPos = Math.floor(mPos.x / (tileWidth * scale));
    const yPos = Math.floor(mPos.y / (tileHeight * scale));
    const type = getTileType(xPos, yPos);
    console.log(type, xPos, yPos, tileInfo);
    let ctx = ref2.current.getContext('2d');
    ctx.clearRect(tileWidth * tileInfo.xPos - 1, tileHeight * tileInfo.yPos - 1, tileWidth + 1, tileHeight + 2);

    const prevTokenId = getTokenId(tileInfo.xPos, tileInfo.yPos);
    if (listingForToken(prevTokenId)) {
      ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
      ctx.fillRect(tileWidth * tileInfo.xPos - 1, tileHeight * tileInfo.yPos - 1, tileWidth + 1, tileHeight + 2);
    }

    if (type == 0 || type == 4) {
      setModalFlag('none');

      return;
    }

    const tokenId = getTokenId(xPos, yPos);
    const listing = listingForToken(tokenId);
    const nft = nftForToken(tokenId);
    console.log('selected data', nft, listing)
    let price = 0;
    if (listing) {
      price = listing.market.price;
    }

    setTileInfo({
      tile: tiles[type - 1],
      tokenId: tokenId,
      type: type,
      xPos: xPos,
      yPos: yPos,
      price: price,
      globalX: mPos.x + zoomState.offsetX - (subDistance > 0 ? 240 - subDistance : 0),
      globalY: mPos.y + zoomState.offsetY,
      listing: listing,
      nft: nft,
      canBuy: !!listing
    });

    ctx.fillStyle = 'rgba(250, 10, 10, 0.5)';
    console.log('tileWidth: ', tileWidth, tileWidth * xPos);
    ctx.fillRect(tileWidth * xPos, tileHeight * yPos + 1, tileWidth - 1, tileHeight - 1);
    setModalFlag('flex');
    setSubDistance(0);
  };

  useEffect(() => {
    ref0.current.height = (ref0.current.clientWidth * 2703) / 4532;
    let canvas_width = (ref0.current.clientWidth * 3.65) / 6;
    let canvas_height = (canvas_width * 620) / 1189;
    ref2.current.width = canvas_width;
    ref2.current.height = canvas_height;

    setTempWidth(ref2.current.width);
    setTempHeight(ref2.current.height);
  }, []);

  // Fill all tiles that have a listing
  useEffect(() => {
    const tileWidth = ref2.current.width / 54;
    const tileHeight = ref2.current.height / 28;

    let ctx = ref2.current.getContext('2d');
    ctx.clearRect(0, 0, ref2.current.width, ref2.current.height);
    ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
    if (listings?.length === 0) {
      return;
    } else {
      for (let i = 0; i < listings.length; i++) {
        const [xPos, yPos] = getPosFromTokenId(parseInt(listings[i].id));
        ctx.fillRect(xPos * tileWidth, yPos * tileHeight, tileWidth, tileHeight);
      }
    }
  }, [listings]);

  useEffect(() => {
    if (minting == false) {
      // let ctx2 = ref2.current.getContext('2d');
      // ctx2.clearRect(0, 0, ref2.current.width, ref2.current.height);
      setTileInfo({ ...tileInfo, xPos: null, yPos: null });
      setModalFlag('none');
    }
  }, [minting]);

  return (
    <div>
      <div
        className="bitpixel_back"
        ref={ref0}
        onMouseDown={(e) => {
          if (window.innerWidth - e.clientX < 240) {
            sub = window.innerWidth - e.clientX;
            setSubDistance(sub);
          }
          if (minting === true || isMintingFlag === true) {
            return;
          } else if (canvasDown === true) {
            setCanvasDown(false);
          }
        }}
      >
        <div className="canvas">
          <TransformWrapper
            onZoom={changeCanvasState}
            onPinching={changeCanvasState}
            onPinchingStop={changeCanvasState}
            onPanningStop={changeCanvasState}
            onPanning={() => setModalFlag('none')}
          >
            <TransformComponent>
              <img src={borderboard} alt="boardboard" style={{ width: `${tempWidth}px`, height: `${tempHeight}px` }} />
              <canvas className="canvasFront" ref={ref2} onClick={handleClick}></canvas>
            </TransformComponent>

            <div
              className="tip_modal"
              style={{ display: modalFlag, left: `${tileInfo.globalX + 15}px`, top: `${tileInfo.globalY + 15}px` }}
            >
              <div className="modal_content">
                <div
                  className="cross"
                  onClick={() => {
                    if (!isMintingFlag) {
                      setModalFlag('none');
                    }
                  }}
                >
                  &times;
                </div>
                <img className="tile_img" src={tileInfo.tile} alt="tile" />
                <div className="tile_items">
                  <div>TokenId: {tileInfo.tokenId}</div>
                  <div>Type: {tileType[tileInfo.type - 1]}</div>
                  <div>
                    Location: {tileInfo.xPos < 27 ? tileInfo.xPos - 27 : tileInfo.xPos - 26},
                    {tileInfo.yPos < 14 ? 14 - tileInfo.yPos : 13 - tileInfo.yPos}
                  </div>
                  <div>Price: {commify(tileInfo.price ?? 0)} CRO</div>
                  <MakeOffer>
                    {tileInfo.canBuy && (
                      <div>
                        <Button type="legacy" onClick={() => onBuy(tileInfo.listing)}>
                          Buy
                        </Button>
                      </div>
                    )}
                    <div>
                      <Button type="legacy-outlined" onClick={() => onOffer(tileInfo.nft)}>
                        Offer
                      </Button>
                    </div>
                  </MakeOffer>
                </div>
              </div>
            </div>
          </TransformWrapper>
        </div>
      </div>
    </div>
  );
};
