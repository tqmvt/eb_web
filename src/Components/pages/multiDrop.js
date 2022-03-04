import React, { useEffect, useState } from 'react';
import { ethers, constants } from 'ethers';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-toastify';
import Countdown from 'react-countdown';
import { getAnalytics, logEvent } from '@firebase/analytics';
import { keyframes } from '@emotion/react';
import Reveal from 'react-awesome-reveal';
import { useParams } from 'react-router-dom';
import { Form, ProgressBar, Spinner } from 'react-bootstrap';
import ReactPlayer from 'react-player';
import * as Sentry from '@sentry/react';
import styled from 'styled-components';
import { Helmet } from 'react-helmet';

import Footer from '../components/Footer';
import config from '../../Assets/networks/rpc_config.json';
import { connectAccount } from '../../GlobalState/User';
import {fetchMemberInfo, fetchVipInfo} from '../../GlobalState/Memberships';
import { fetchCronieInfo } from '../../GlobalState/Cronies';
import {
  createSuccessfulTransactionToastContent,
  isCreaturesDrop,
  isCrognomesDrop,
  isFounderDrop, isFounderVipDrop,
  isMagBrewVikingsDrop,
  newlineText,
  percentage,
} from '../../utils';
import { dropState as statuses } from '../../core/api/enums';
import { EbisuDropAbi } from '../../Contracts/Abis';

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

const MultiDrop = () => {
  const { slug } = useParams();

  const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [minting, setMinting] = useState(false);
  const [referral, setReferral] = useState('');
  const [dropObject, setDropObject] = useState(null);
  const [status, setStatus] = useState(statuses.UNSET);
  const [numToMint, setNumToMint] = useState(1);

  const [abi, setAbi] = useState(null);
  const [maxMintPerAddress, setMaxMintPerAddress] = useState(0);
  const [maxMintPerTx, setMaxMintPerTx] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);
  const [memberCost, setMemberCost] = useState(0);
  const [regularCost, setRegularCost] = useState(0);
  const [whitelistCost, setWhitelistCost] = useState(0);
  const [specialWhitelistCost, setSpecialWhitelistCost] = useState(0);
  const [totalSupply, setTotalSupply] = useState(0);
  const [canMintQuantity, setCanMintQuantity] = useState(0);

  useEffect(() => {
    logEvent(getAnalytics(), 'screen_view', {
      firebase_screen: 'drop',
      drop_id: slug,
    });
  }, []);

  useEffect(() => {
    dispatch(fetchMemberInfo());
    if (process.env.NODE_ENV === 'development') {
      dispatch(fetchVipInfo());
    }
    dispatch(fetchCronieInfo());
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

  useEffect(async () => {
    await retrieveDropInfo();
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
      let readContract = await new ethers.Contract(currentDrop.address, abi, readProvider);
      const infos = (await readContract.getInfo())[0];
      console.log(infos);

      const canMint = user.address ? await readContract.canMint(user.address) : 0;
      const mintCost = await readContract.mintCost(user.address);
      console.log('mings',
          canMint,
          canMint[0].toString(),
          canMint[1].toString(),
          canMint[2].toString(),
          mintCost.toString()
      );

      setMaxMintPerAddress(infos.maxMintPerAddress);
      setMaxMintPerTx(infos.maxMintPerTx);
      setMaxSupply(infos.maxSupply);
      setMemberCost(ethers.utils.formatEther(infos.memberCost));
      setRegularCost(ethers.utils.formatEther(infos.regularCost));
      setTotalSupply(infos.totalSupply);
      if (infos.whitelistCost) setWhitelistCost(ethers.utils.formatEther(infos.whitelistCost));
      setCanMintQuantity(canMint);
      calculateStatus(currentDrop, infos.totalSupply, infos.maxSupply);
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }
    setLoading(false);
    setDropObject(currentDrop);
  };

  const setDropInfo = (drop, supply) => {
    setMaxMintPerAddress(drop.maxMintPerAddress ?? 100);
    setMaxMintPerTx(drop.maxMintPerTx);
    setMaxSupply(drop.totalSupply);
    setMemberCost(drop.memberCost);
    setRegularCost(drop.cost);
    setTotalSupply(supply);
    setWhitelistCost(drop.whitelistCost);
    setSpecialWhitelistCost(drop.specialWhitelistCost);
    setCanMintQuantity(drop.maxMintPerTx);
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

  const calculateCost = async (user) => {
    if (isUsingDefaultDropAbi(dropObject.abi) || isUsingAbiFile(dropObject.abi)) {
      let readContract = await new ethers.Contract(dropObject.address, abi, readProvider);
      if (abi.find((m) => m.name === 'cost')) {
        return await readContract.cost(user.address);
      }
      return await readContract.mintCost(user.address);
    }

    const memberCost = ethers.utils.parseEther(dropObject.memberCost);
    const regCost = ethers.utils.parseEther(dropObject.cost);
    let cost;
    if (dropObject.abi.join().includes('isReducedTime()')) {
      const readContract = await new ethers.Contract(dropObject.address, dropObject.abi, readProvider);
      const isReduced = await readContract.isReducedTime();
      cost = isReduced ? memberCost : regCost;
    } else if (user.isMember) {
      cost = memberCost;
    } else {
      cost = regCost;
    }
    return cost;
  };

  const isUsingAbiFile = (dropAbi) => {
    return typeof dropAbi === 'string' && dropAbi.length > 0;
  };

  const isUsingDefaultDropAbi = (dropAbi) => {
    return typeof dropAbi === 'undefined' || dropAbi.length === 0;
  };

  const mintNow = async (faction) => {
    if (user.address) {
      if (!dropObject.writeContract) {
        return;
      }

      setMinting(true);
      const contract = dropObject.writeContract;
      try {
        const cost = await calculateCost(user);
        let finalCost = cost.mul(numToMint);
        let extra = {
          value: finalCost,
          faction: faction
        };

        console.log('minting', numToMint, faction, extra);
        const response = await contract.mint(numToMint, ethers.utils.formatBytes32String(faction));
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
            value: ethers.utils.formatEther(finalCost),
            transaction_id: receipt.transactionHash,
            quantity: numToMint,
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

  const convertTime = (time) => {
    let date = new Date(time);
    const fullDateString = date.toLocaleString('default', { timeZone: 'UTC' });
    const month = date.toLocaleString('default', { month: 'long', timeZone: 'UTC' });
    let dateString = `${fullDateString.split(', ')[1]} ${date.getUTCDate()} ${month} ${date.getUTCFullYear()} UTC`;
    return dateString;
  };

  // const vidRef = useRef(null);
  // const handlePlayVideo = () => {
  //   vidRef.current.play();
  // };

  return (
    <div>
      <>
        <Helmet>
          <title>{drop?.title || 'Drop'} | Ebisu's Bay Marketplace</title>
          <meta name="description" content={`${drop?.title || 'Drop'} for Ebisu's Bay Marketplace`} />
          <meta name="title" content={`${drop?.title || 'Drop'} | Ebisu's Bay Marketplace`} />
          <meta property="og:title" content={`${drop?.title || 'Drop'} | Ebisu's Bay Marketplace`} />
          <meta property="og:url" content={`https://app.ebisusbay.com/drops/${slug}`} />
          <meta property="og:image" content={`https://app.ebisusbay.com${drop?.imgAvatar || '/'}`} />
          <meta name="twitter:title" content={`${drop?.title || 'Drop'} | Ebisu's Bay Marketplace`} />
          <meta name="twitter:image" content={`https://app.ebisusbay.com${drop?.imgAvatar || '/'}`} />
        </Helmet>
        <HeroSection
          className={`jumbotron h-vh tint`}
          style={{ backgroundImage: `url(${drop.imgBanner ? drop.imgBanner : '/img/background/Ebisus-bg-1_L.webp'})` }}
        >
          <div className="container">
            <div className="row align-items-center">
              <div className={`col-lg-6 ${drop.mediaPosition === 'left' ? 'order-1' : 'order-2'}`}>
                <Reveal className="onStep" keyframes={fadeInUp} delay={600} duration={900} triggerOnce>
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

        <section className="container no-bottom" id="drop_detail">
          <div className="card-group">
            <div className="d-item col-sm-4 mb-4 px-2">
              <MultiDropCard
                title={'Aqua'}
                img={'/img/drops/cronosmb/gorilla/aqua.png'}
                canMintQuantity={canMintQuantity}
                mintNow={() => mintNow('AQUA')}
              />
            </div>
            <div className="d-item col-sm-4 mb-4 px-2">
              <MultiDropCard
                title={'Ignis'}
                img={'/img/drops/cronosmb/gorilla/fire.png'}
                canMintQuantity={canMintQuantity}
                mintNow={() => mintNow('IGNIS')}
              />
            </div>
            <div className="d-item col-sm-4 mb-4 px-2">
              <MultiDropCard
                title={'Terra'}
                img={'/img/drops/cronosmb/gorilla/desert.png'}
                canMintQuantity={canMintQuantity}
                mintNow={() => mintNow('TERRA')}
              />
            </div>
          </div>
        </section>
      </>
      <Footer />
    </div>
  );
};
export default MultiDrop;

const MultiDropCard = ({title, img, canMintQuantity, mintNow}) => {
  const [minting, setMinting] = useState(false);
  const [numToMint, setNumToMint] = useState(1);

  const beginMint = async () => {
    setMinting(true);
    await mintNow();
    setMinting(false);
  }

  return (
      <div className="card eb-nft__card h-100 shadow">
        <img
            src={img}
            className={`card-img-top`}
        />
        <div className="card-body d-flex flex-column">
          <h2>{title}</h2>
          <div>
            <Form.Label>Quantity</Form.Label>
            <Form.Range
                value={numToMint}
                min="1"
                max={canMintQuantity}
                onChange={(e) => setNumToMint(e.target.value)}
            />
          </div>
          <button className="btn-main lead mb-5 mr15" onClick={beginMint} disabled={minting}>
            {minting ? (
                <>
                  Minting...
                  <Spinner animation="border" role="status" size="sm" className="ms-1">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </>
            ) : (
                <>Mint {numToMint}</>
            )}
          </button>
        </div>
      </div>
  );
}