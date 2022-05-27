import React, { useEffect, useState, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Head from 'next/head';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import Countdown from 'react-countdown';
import { getAnalytics, logEvent } from '@firebase/analytics';
import { keyframes } from '@emotion/react';
import Reveal from 'react-awesome-reveal';
import { useRouter } from 'next/router';
import { Spinner } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import * as Sentry from '@sentry/react';
import styled from 'styled-components';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';

import Footer from '../components/Footer';
import config from '../../Assets/networks/rpc_config.json';
import { connectAccount } from '../../GlobalState/User';
import { createSuccessfulTransactionToastContent, isFounderDrop, newlineText } from '../../utils';
import { dropState as statuses } from '../../core/api/enums';
import { EbisuDropAbi } from '../../Contracts/Abis';

import styles from '../Collection/collectionCronosverse/CollectionCronosverse.module.scss';

const tiles = [
  '/img/cronosverse/Plain-tile.png',
  '/img/cronosverse/Suburban-tile.png',
  '/img/cronosverse/Commercial-tile.png',
];
const tileType = ['Plain', 'Suburban', 'Commercial'];

export const drops = config.drops;

const fadeInUp = keyframes`
  0% {
    opacity: 0;
    -webkit-transform: translateY(40px);
    transform: translateY(40px);
  }
  100% {
    opacity: 1;
    -webkit-transform: translateY(0);
    transform: translateY(0);
  }
`;

const HeroSection = styled.section`
  border-radius: 0;
  margin: 0;
  padding: 0 0;
  background-size: cover;
  width: 100%;
  height: 100vh;
  position: relative;
  display: flex;
  align-items: center;

  .h-vh {
    height: 100vh;
    display: flex;
    align-items: center;
    background-position: center;
    background-size: cover;
  }
`;

const CronosverseDrop = () => {
  const router = useRouter();
  const { slug } = router.query;

  const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  // const [referral, setReferral] = useState('');
  const [dropObject, setDropObject] = useState(null);
  const [status, setStatus] = useState(statuses.UNSET);
  const [whitelisted, setWhiteListed] = useState(false);

  const [abi, setAbi] = useState(null);
  const [mintedIds, setMintedIds] = useState([]);
  const [maxSupply, setMaxSupply] = useState(0);
  const [whitelistCost, setWhitelistCost] = useState([]);
  const [memberCost, setMemberCost] = useState([]);
  const [regularCost, setRegularCost] = useState([]);
  const [totalSupply, setTotalSupply] = useState(0);

  useEffect(() => {
    logEvent(getAnalytics(), 'screen_view', {
      firebase_screen: 'drop',
      drop_id: slug,
    });
    // eslint-disable-next-line
  }, []);

  const user = useSelector((state) => {
    return state.user;
  });

  const drop = useSelector((state) => {
    return drops.find((n) => n.slug === slug);
  });

  const membership = useSelector((state) => {
    return state.memberships;
  });

  const cronies = useSelector((state) => {
    return state.cronies;
  });

  useEffect(() => {
    async function fetchData() {
      await retrieveDropInfo();
    }
    fetchData();
    // eslint-disable-next-line
  }, [user, membership, cronies]);

  const retrieveDropInfo = async () => {
    setDropObject(drop);
    let currentDrop = drop;

    // Don't do any contract stuff if the drop does not have an address
    if (!drop.address || drop.complete) {
      setDropInfo(currentDrop, 0);
      calculateStatus(currentDrop, drop.complete ? currentDrop.totalSupply : 0, currentDrop.totalSupply);
      return;
    }

    // Use the new contract format if applicable
    let abi = currentDrop.abi;
    if (isUsingAbiFile(abi)) {
      const abiJson = require(`../../Assets/abis/${currentDrop.abi}`);
      abi = abiJson.abi ?? abiJson;
    } else if (isUsingDefaultDropAbi(abi)) {
      abi = EbisuDropAbi;
    }
    setAbi(abi);

    if (user.provider) {
      try {
        let writeContract = await new ethers.Contract(currentDrop.address, abi, user.provider.getSigner());
        currentDrop = Object.assign({ writeContract: writeContract }, currentDrop);
      } catch (error) {
        console.log(error);
        Sentry.captureException(error);
      }
    }
    try {
      if (currentDrop.address && (isUsingDefaultDropAbi(currentDrop.abi) || isUsingAbiFile(currentDrop.abi))) {
        let readContract = await new ethers.Contract(currentDrop.address, abi, readProvider);
        const infos = await readContract.getInfo();
        // console.log('info\n--------\n',
        //   `maxMintPerTx: ${infos.maxMintPerTx}\n`,
        //   `maxSupply: ${infos.maxSupply}\n`,
        //   `totalSupply: ${infos.totalSupply}\n`,
        //   `memberCost: ${infos.memberCost}\n`,
        //   `regularCost: ${infos.regularCost}\n`,
        //   `whitelistCost: ${infos.whitelistCost}\n`
        // );
        // const canMint = user.address ? await readContract.canMint(user.address) : 0;
        // console.log('canMint: ', canMint.toString())
        const isWhitelisted = user.address ? await readContract.isWhiteList(user.address) : false;
        // console.log('isWhitelisted: ', isWhitelisted);
        setWhiteListed(isWhitelisted);
        setMaxSupply(infos.maxSupply);
        setWhitelistCost([
          ethers.utils.formatEther(infos.whitelistCost[0]),
          ethers.utils.formatEther(infos.whitelistCost[1]),
          ethers.utils.formatEther(infos.whitelistCost[2]),
        ]);
        setMemberCost([
          ethers.utils.formatEther(infos.memberCost[0]),
          ethers.utils.formatEther(infos.memberCost[1]),
          ethers.utils.formatEther(infos.memberCost[2]),
        ]);
        setRegularCost([
          ethers.utils.formatEther(infos.regularCost[0]),
          ethers.utils.formatEther(infos.regularCost[1]),
          ethers.utils.formatEther(infos.regularCost[2]),
        ]);
        setTotalSupply(infos.totalSupply);
        calculateStatus(currentDrop, infos.totalSupply, infos.maxSupply);
        const mintedIds = await readContract.getMintedIds();
        setMintedIds(mintedIds.map((id) => id.toString()));
      } else {
        let readContract = await new ethers.Contract(currentDrop.address, abi, readProvider);
        const currentSupply = await readContract.totalSupply();
        setDropInfo(currentDrop, currentSupply);
        calculateStatus(currentDrop, currentSupply, currentDrop.totalSupply);
      }
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }
    setLoading(false);
    setDropObject(currentDrop);
  };

  const setDropInfo = (drop, supply) => {
    setMaxSupply(drop.totalSupply);
    setMemberCost(drop.memberCost);
    setRegularCost(drop.cost);
    setWhitelistCost(drop.whitelistCost);
    setTotalSupply(supply);
  };

  const calculateStatus = (drop, totalSupply, maxSupply) => {
    const sTime = new Date(drop.start);
    const eTime = new Date(drop.end);
    const now = new Date();
    if (!drop.start || !drop.address || sTime > now) setStatus(statuses.NOT_STARTED);
    else if (parseInt(totalSupply.toString()) >= parseInt(maxSupply.toString()) && !isFounderDrop(drop.address))
      setStatus(statuses.SOLD_OUT);
    else if (!drop.end || eTime > now) setStatus(statuses.LIVE);
    else if (drop.end && eTime < now) setStatus(statuses.EXPIRED);
    else setStatus(statuses.NOT_STARTED);
  };

  // const handleChangeReferralCode = (event) => {
  //   const { value } = event.target;
  //   setReferral(value);
  // };

  const calculateCost = async (user, id) => {
    if (isUsingDefaultDropAbi(dropObject.abi) || isUsingAbiFile(dropObject.abi)) {
      let readContract = await new ethers.Contract(dropObject.address, abi, readProvider);
      return await readContract.mintCost(user.address, id);
    }

    return -1;
  };

  const isUsingAbiFile = (dropAbi) => {
    return typeof dropAbi === 'string' && dropAbi.length > 0;
  };

  const isUsingDefaultDropAbi = (dropAbi) => {
    return typeof dropAbi === 'undefined' || dropAbi.length === 0;
  };

  const mintNow = async (id, price) => {
    if (user.address) {
      if (!dropObject.writeContract) {
        return;
      }
      setMinting(true);
      const contract = dropObject.writeContract;
      try {
        let cost = await calculateCost(user, id);
        if (cost === -1) cost = ethers.utils.parseEther(price);
        let extra = {
          value: cost,
          gasPrice: ethers.utils.parseUnits('5000', 'gwei'),
        };
        console.log('cost: ', cost, id);

        var response;
        response = await contract.mint(id, extra);
        const receipt = await response.wait();
        toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
        {
          const dropObjectAnalytics = {
            address: dropObject.address,
            id: dropObject.id,
            title: dropObject.title,
            slug: dropObject.slug,
            author_name: dropObject.author.name,
            author_link: dropObject.author.link,
            maxMintPerTx: dropObject.maxMintPerTx,
            totalSupply: dropObject.totalSupply,
            cost: dropObject.cost,
            memberCost: dropObject.memberCost,
            foundersOnly: dropObject.foundersOnly,
          };

          const purchaseAnalyticParams = {
            currency: 'CRO',
            value: ethers.utils.formatEther(cost),
            transaction_id: receipt.transactionHash,
            id: id,
            items: [dropObjectAnalytics],
          };

          logEvent(getAnalytics(), 'purchase', purchaseAnalyticParams);
        }

        await retrieveDropInfo();
      } catch (error) {
        Sentry.captureException(error);
        if (error.data) {
          console.log(error);
          toast.error(error.data.message);
        } else if (error.message) {
          console.log(error);
          toast.error(error.message);
        } else {
          console.log(error);
          toast.error('Unknown Error');
        }
      } finally {
        setMinting(false);
      }
    } else {
      dispatch(connectAccount());
    }
  };

  return (
    <div>
      <>
        <Head>
          <title>{drop?.title || 'Drop'} | Ebisu's Bay Marketplace</title>
          <meta name="description" content={`${drop?.title || 'Drop'} for Ebisu's Bay Marketplace`} />
          <meta name="title" content={`${drop?.title || 'Drop'} | Ebisu's Bay Marketplace`} />
          <meta property="og:title" content={`${drop?.title || 'Drop'} | Ebisu's Bay Marketplace`} />
          <meta property="og:url" content={`https://app.ebisusbay.com/drops/${slug}`} />
          <meta property="og:image" content={`https://app.ebisusbay.com${drop?.imgAvatar || '/'}`} />
          <meta name="twitter:title" content={`${drop?.title || 'Drop'} | Ebisu's Bay Marketplace`} />
          <meta name="twitter:image" content={`https://app.ebisusbay.com${drop?.imgAvatar || '/'}`} />
        </Head>
        <HeroSection
          className={`jumbotron h-vh tint`}
          style={{ backgroundImage: `url(${drop.imgBanner ? drop.imgBanner : '/img/background/Ebisus-bg-1_L.webp'})` }}
        >
          <div className="container">
            <div className="row align-items-center">
              <div className={`col-lg-6 ${drop.mediaPosition === 'left' ? 'order-1' : 'order-2'}`}>
                <Reveal className="onStep" keyframes={fadeInUp} delay={600} duration={900} triggerOnce>
                  <>
                    {drop.video && (
                      <ReactPlayer
                        controls
                        url={drop.video}
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
                        width="75%"
                        height="75%"
                      />
                    )}

                    {drop.embed && <div dangerouslySetInnerHTML={{ __html: drop.embed }} />}
                  </>
                </Reveal>
              </div>
              <div className={`col-lg-6 ${drop.mediaPosition === 'left' ? 'order-2' : 'order-1'}`}>
                <div className="spacer-single"></div>
                <div className="spacer-double"></div>

                {status === statuses.LIVE && drop.end && (
                  <Reveal className="onStep" keyframes={fadeInUp} delay={600} duration={900} triggerOnce>
                    <p className="lead col-white">
                      Ends in: <Countdown date={drop.end} />
                    </p>
                  </Reveal>
                )}
                {status === statuses.NOT_STARTED && drop.start && (
                  <Reveal className="onStep" keyframes={fadeInUp} delay={600} duration={900} triggerOnce>
                    <h4 className="col-white">
                      Starts in:{' '}
                      <span className="text-uppercase color">
                        <Countdown date={drop.start} />
                      </span>
                    </h4>
                  </Reveal>
                )}
                <Reveal className="onStep" keyframes={fadeInUp} delay={300} duration={900} triggerOnce>
                  <h1 className="col-white">{drop.title}</h1>
                </Reveal>
                <Reveal className="onStep" keyframes={fadeInUp} delay={300} duration={900} triggerOnce>
                  <div className="lead col-white">{newlineText(drop.subtitle)}</div>
                </Reveal>
                {drop.foundersOnly && (
                  <Reveal className="onStep" keyframes={fadeInUp} delay={300} duration={900} triggerOnce>
                    <h1 className="col-white">{drop.title}</h1>
                    {drop.foundersOnly && <h3 className="col-white">Founding Member Presale</h3>}
                  </Reveal>
                )}
                <Reveal className="onStep" keyframes={fadeInUp} delay={300} duration={900} triggerOnce>
                  <div>
                    <a href="#drop_detail" className="btn-main">
                      View Drop
                    </a>
                  </div>
                </Reveal>
                <div className="spacer-10"></div>
              </div>
            </div>
          </div>
        </HeroSection>

        <section className="container no-bottom" id="drop_detail">
          <div className="row">
            <div className="col-md-12">
              <div className="d_profile de-flex">
                <div className="de-flex-col">
                  <div className="profile_avatar">
                    {drop.imgAvatar && <img src={drop.imgAvatar} alt={drop.author.name} />}
                    <div className="profile_name">
                      <h4>
                        {drop.author.name}
                        {drop.author.link && (
                          <span className="profile_username">
                            <a href={drop.author.link} target="_blank" rel="noreferrer">
                              View Website
                            </a>
                          </span>
                        )}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="container no-top">
          <div className="row">
            <div className="item_info">
              <h2>{drop.title}</h2>
              <div className="mt-3">{newlineText(drop.description)}</div>
            </div>
          </div>
          <div className="d-flex flex-row">
            <div className="me-4">
              <h6 className="mb-1">Mint Price</h6>
              <ul className="list-unstyled">
                <li>{regularCost[0]} CRO (Plain)</li>
                <li>{regularCost[1]} CRO (Suburban)</li>
                <li>{regularCost[2]} CRO (Commercial)</li>
              </ul>
            </div>
            {memberCost && (
              <div className="me-4">
                <h6 className="mb-1">Founding Member Price</h6>
                <ul className="list-unstyled">
                  <li>{memberCost[0]} CRO (Plain)</li>
                  <li>{memberCost[1]} CRO (Suburban)</li>
                  <li>{memberCost[2]} CRO (Commercial)</li>
                </ul>
              </div>
            )}
            {whitelistCost && (
              <div className="me-4">
                <h6 className="mb-1">Whitelist Price</h6>
                <ul className="list-unstyled">
                  <li>{whitelistCost[0]} CRO (Plain)</li>
                  <li>{whitelistCost[1]} CRO (Suburban)</li>
                  <li>{whitelistCost[2]} CRO (Commercial)</li>
                </ul>
              </div>
            )}
          </div>
          {drop.priceDescription && (
            <p className="my-2" style={{ color: 'black' }}>
              *{drop.priceDescription}
            </p>
          )}
          <div className="me-4 mt-4">
            <h6 className="mb-1">Presale Starts</h6>
            <h3>
              {new Date(drop.salePeriods.presale).toDateString()}, {new Date(drop.salePeriods.presale).toTimeString()}
            </h3>
          </div>
          <div className="me-4 mt-4">
            <h6 className="mb-1">Public Sale Starts</h6>
            <h3>
              {new Date(drop.salePeriods.public).toDateString()}, {new Date(drop.salePeriods.public).toTimeString()}
            </h3>
          </div>
          {status === statuses.NOT_STARTED && !drop.start && (
            <div className="me-4 mt-4">
              <h6 className="mb-1">Minting Starts</h6>
              <h3>TBA</h3>
            </div>
          )}
          {status >= statuses.LIVE && !drop.complete && (
            <>
              {status === statuses.SOLD_OUT && <p className="mt-5">MINT HAS SOLD OUT</p>}
              {status === statuses.EXPIRED && <p className="mt-5">MINT HAS ENDED</p>}
              <div className="row mt-md-2">
                <CronosverseMintBoard
                  mintNow={mintNow}
                  minting={minting}
                  mintedIds={mintedIds}
                  prices={whitelisted ? whitelistCost : user.isMember ? memberCost : regularCost}
                />
              </div>
            </>
          )}
        </section>
      </>
      <Footer />
    </div>
  );
};
export default CronosverseDrop;

const CronosverseMintBoard = ({ mintNow, minting, mintedIds, prices }) => {
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

  const isMinted = (tokenId) => {
    return mintedIds?.some((id) => parseInt(tokenId) === parseInt(id));
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
    if (type === 0 || type === 4) {
      setModalFlag('none');

      return;
    }
    const tokenId = getTokenId(xPos, yPos);
    if (isMinted(tokenId)) {
      console.log('minted');
      setModalFlag('none');
      return;
    }

    setTileInfo({
      tile: tiles[type - 1],
      tokenId: tokenId,
      type: type,
      xPos: xPos,
      yPos: yPos,
      price: prices?.[type - 1],
      globalX: mPos.x + zoomState.offsetX - (subDistance > 0 ? 240 - subDistance : 0),
      globalY: mPos.y + zoomState.offsetY,
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

  useEffect(() => {
    const tileWidth = ref2.current.width / 54;
    const tileHeight = ref2.current.height / 28;

    let ctx = ref2.current.getContext('2d');
    ctx.clearRect(0, 0, ref2.current.width, ref2.current.height);
    ctx.fillStyle = 'rgba(50, 50, 50, 0.5)';
    if (mintedIds?.length === 0) {
      return;
    } else {
      for (let i = 0; i < mintedIds.length; i++) {
        const [xPos, yPos] = getPosFromTokenId(parseInt(mintedIds[i]));
        ctx.fillRect(xPos * tileWidth, yPos * tileHeight, tileWidth, tileHeight);
      }
    }
  }, [mintedIds]);

  useEffect(() => {
    if (minting === false) {
      // let ctx2 = ref2.current.getContext('2d');
      // ctx2.clearRect(0, 0, ref2.current.width, ref2.current.height);
      setTileInfo({ ...tileInfo, xPos: null, yPos: null });
      setModalFlag('none');
    }
    // eslint-disable-next-line
  }, [minting]);

  return (
    <div>
      <div
        className={`${styles.bitpixel_back}`}
        ref={ref0}
        onMouseDown={(e) => {
          if (typeof window !== 'undefined' && window.innerWidth - e.clientX < 240) {
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
                src="/img/cronosverse/border_board.png"
                alt="boardboard"
                width={`${tempWidth}px`}
                height={`${tempHeight}px`}
              />
              <canvas className={`${styles.canvasFront}`} ref={ref2} onClick={handleClick}></canvas>
            </TransformComponent>

            <div
              className={styles.tip_modal}
              style={{ display: modalFlag, left: `${tileInfo.globalX + 15}px`, top: `${tileInfo.globalY + 15}px` }}
            >
              <div className="modal_content">
                <div
                  className={styles.cross}
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
                  <div>Price: {tileInfo.price} CRO</div>
                  <button
                    className="btn-main lead"
                    onClick={async () => {
                      setIsMintingFlag(true);
                      await mintNow(tileInfo.tokenId, tileInfo.price);

                      setIsMintingFlag(false);
                    }}
                    disabled={minting}
                  >
                    {minting ? (
                      <>
                        Minting...
                        <Spinner animation="border" role="status" size="sm" className="ms-1">
                          <span className="visually-hidden">Loading...</span>
                        </Spinner>
                      </>
                    ) : (
                      <>Mint</>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </TransformWrapper>
        </div>
      </div>
    </div>
  );
};
