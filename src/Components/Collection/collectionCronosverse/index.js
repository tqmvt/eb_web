import React, { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import MetaMaskOnboarding from '@metamask/onboarding';
import { commify } from 'ethers/lib/utils';
import { TransformComponent, TransformWrapper } from 'react-zoom-pan-pinch';

import { init, fetchListings } from '../../../GlobalState/collectionSlice';
import { devLog } from '../../../utils';
import { CollectionSortOption } from '../../Models/collection-sort-option.model';
import { FilterOption } from '../../Models/filter-option.model';
import Button from '../../components/Button';
import { chainConnect, connectAccount } from '../../../GlobalState/User';
import MakeOfferDialog from '../../Offer/MakeOfferDialog';

import styles from './CollectionCronosverse.module.scss';

const CollectionCronosverse = ({ collection }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const user = useSelector((state) => state.user);
  const items = useSelector((state) => state.collection.listings);
  const listings = useSelector((state) => state.collection.listings.filter((item) => item.market.id));

  const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);
  const [nftOffer, setNftOffer] = useState(null);

  useEffect(() => {
    const filterOption = FilterOption.default();
    filterOption.type = 'collection';
    filterOption.address = collection.address;
    dispatch(init(filterOption, CollectionSortOption.default(), {}, collection.address));
    dispatch(fetchListings(true));
    // eslint-disable-next-line
  }, [dispatch]);

  const handleMakeOffer = (nft) => {
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
    // if (listing.market?.id) {
    //   history.push(`/listing/${listing.market?.id}`);
    // } else {
    router.push(`/collection/${listing.address}/${listing.id}`);
    // }
  };

  return (
    <div>
      <CronosverseCollectionBoard onBuy={handleBuy} onOffer={handleMakeOffer} listings={listings} nfts={items} />
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

const tiles = [
  '/img/cronosverse/Plain-tile.png',
  '/img/cronosverse/Suburban-tile.png',
  '/img/cronosverse/Commercial-tile.png',
];
const tileType = ['Plain', 'Suburban', 'Commercial'];

const CronosverseCollectionBoard = ({ onBuy, onOffer, listings = [], nfts = [] }) => {
  const ref0 = useRef();
  const ref2 = useRef();
  const [tileInfo, setTileInfo] = useState({});
  const [modalFlag, setModalFlag] = useState('none');
  // const [canvasDown, setCanvasDown] = useState(false);
  const [zoomState, setZoomState] = useState({
    offsetX: 0,
    offsetY: 0,
    scale: 1,
  });
  const isMintingFlag = false; // todo: lint fix
  // const [isMintingFlag, setIsMintingFlag] = useState(false);

  const [tempWidth, setTempWidth] = useState(1);
  const [tempHeight, setTempHeight] = useState(1);
  // const previousX = useRef()
  // const previousY = useRef()

  const [subDistanceX, setSubDistanceX] = useState(0);
  const [subDistanceY, setSubDistanceY] = useState(0);
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
    return listings.find((listing) => parseInt(tokenId) === parseInt(listing.id));
  };

  const nftForToken = (tokenId) => {
    return nfts.find((nft) => parseInt(tokenId) === parseInt(nft.id));
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
    devLog('mouse', e.clientX, e.clientY, rect.left, rect.top);
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  };

  const handleClick = (e) => {
    const mPos = getMousePos(e);
    let scale = zoomState.scale;
    const tileWidth = ref2.current.width / 54;
    const tileHeight = ref2.current.height / 28;
    const xPos = Math.floor(mPos.x / (tileWidth * scale));
    const yPos = Math.floor(mPos.y / (tileHeight * scale));
    const type = getTileType(xPos, yPos);
    devLog(type, xPos, yPos, tileInfo);
    let ctx = ref2.current.getContext('2d');
    ctx.clearRect(tileWidth * tileInfo.xPos - 1, tileHeight * tileInfo.yPos - 1, tileWidth + 1, tileHeight + 2);

    const prevTokenId = getTokenId(tileInfo.xPos, tileInfo.yPos);
    if (listingForToken(prevTokenId)) {
      ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
      ctx.fillRect(tileWidth * tileInfo.xPos - 1, tileHeight * tileInfo.yPos - 1, tileWidth + 1, tileHeight + 2);
    }

    if (type === 0 || type === 4) {
      setModalFlag('none');

      return;
    }

    const tokenId = getTokenId(xPos, yPos);
    const listing = listingForToken(tokenId);
    const nft = nftForToken(tokenId);
    devLog('selected data', nft, listing);
    let price = 0;
    if (listing) {
      price = listing.market.price;
    }

    const globalX = mPos.x + zoomState.offsetX - (subDistanceX > 0 ? 240 - subDistanceX : 0);
    const globalY = mPos.y + zoomState.offsetY - (subDistanceY > 0 ? 175 - subDistanceY : 0);

    setTileInfo({
      tile: tiles[type - 1],
      tokenId: tokenId,
      type: type,
      xPos: xPos,
      yPos: yPos,
      price: price,
      globalX: globalX,
      globalY: globalY,
      listing: listing,
      nft: nft,
      canBuy: !!listing,
      modalPosition: { x: globalX + 15, y: globalY + 15 },
      // getModalPosition(e.clientX, e.clientY, globalX, globalY)
    });

    ctx.fillStyle = 'rgba(250, 10, 10, 0.5)';
    devLog('tileWidth: ', tileWidth, tileWidth * xPos);
    ctx.fillRect(tileWidth * xPos, tileHeight * yPos + 1, tileWidth - 1, tileHeight - 1);
    setModalFlag('flex');
    setSubDistanceX(0);
    setSubDistanceY(0);
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

  return (
    <div>
      <div
        className={`${styles.bitpixel_back}`}
        ref={ref0}
        onMouseDown={(e) => {
          if (typeof window !== 'undefined' && window.innerWidth - e.clientX < 240) {
            sub = window.innerWidth - e.clientX;
            setSubDistanceX(sub);
          }
          if (typeof window !== 'undefined' && window.innerHeight - e.clientY < 175) {
            sub = window.innerHeight - e.clientY;
            setSubDistanceY(sub);
          }
        }}
      >
        <div className={`${styles.canvas}`}>
          <TransformWrapper
            onZoom={changeCanvasState}
            onPinching={changeCanvasState}
            onPinchingStop={changeCanvasState}
            onPanningStop={changeCanvasState}
            onPanning={() => setModalFlag('none')}
          >
            <TransformComponent>
              <img
                src={'/img/cronosverse/border_board.png'}
                alt="boardboard"
                style={{ width: `${tempWidth}px`, height: `${tempHeight}px` }}
              />
              <canvas className={`${styles.canvasFront}`} ref={ref2} onClick={handleClick}></canvas>
            </TransformComponent>

            <div
              className={`${styles.tip_modal}`}
              style={{
                display: modalFlag,
                left: `${tileInfo.modalPosition?.x}px`,
                top: `${tileInfo.modalPosition?.y}px`,
              }}
            >
              <div className="modal_content">
                <div
                  className={`${styles.cross}`}
                  onClick={() => {
                    setModalFlag('none');
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
                  {tileInfo.canBuy && <div>Price: {commify(tileInfo.price ?? 0)} CRO</div>}
                  <MakeOffer>
                    {tileInfo.canBuy && (
                      <div className="me-2">
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
