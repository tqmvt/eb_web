import React, { memo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStakeCount, setVIPCount } from '../../GlobalState/User';
import {Form, Spinner} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {createSuccessfulTransactionToastContent, round} from '../../utils';
import {Contract, ethers} from "ethers";
import {RewardsPoolAbi} from "../../Contracts/Abis";
import config from "../../Assets/networks/rpc_config.json";
import {commify} from "ethers/lib.esm/utils";
import Countdown from "react-countdown";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBatteryEmpty,
  faBatteryFull, faBatteryHalf,
  faBatteryQuarter, faBatteryThreeQuarters,
  faBolt, faChargingStation, faExclamationTriangle,
  faExternalLinkAlt,
  faTrophy
} from "@fortawesome/free-solid-svg-icons";

const txExtras = {
  gasPrice: ethers.utils.parseUnits('5000', 'gwei'),
}

const MyStaking = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const stakeCount = user.stakeCount;
  const vipCount = user.vipCount;
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [amount, setAmount] = useState(1);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [currentPoolId, setCurrentPoolId] = useState(null);
   
  // Allow exception to be thrown for other functions to catch it
  const setApprovalForAll = async () => {
    const isApproved = await user.membershipContract.isApprovedForAll(user.stakeContract.address, user.address);
    if (!isApproved) {
      let tx = await user.membershipContract.setApprovalForAll(user.stakeContract.address, true, txExtras);
      await tx.wait();
    }
  };

  const approve = async () => {
    try {
      setIsApproving(true);
      await setApprovalForAll();
      setIsApproved(true);
    } catch (error) {
      if (error.data) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Unknown Error');
      }
    } finally {
      setIsApproving(false);
    }
  }

  const stake = async () => {
    if (!user.stakeContract || amount === 0) return;
    if (amount > vipCount) {
      toast.error("You do not have enough available VIPs");
      return;
    }
    try {
      setIsStaking(true);
      if (!isApproved) await approve();
      const tx = await user.stakeContract.stake(amount, txExtras);
      const receipt = await tx.wait();
      dispatch(setStakeCount(stakeCount + amount));
      dispatch(setVIPCount(vipCount - amount));
      toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
    } catch(err) {
      toast.error(err.message);
    } finally {
      setIsStaking(false);
    }
  }

  const unStake = async () => {
    if (!user.stakeContract || amount <=0) return;
    if (amount > stakeCount) {
      toast.error('You do not have enough available VIPs');
      return;
    }
    try {
      setIsUnstaking(true);
      const tx = await user.stakeContract.unstake(amount, { gasPrice: 5000000000000 });
      const receipt = await tx.wait();
      dispatch(setStakeCount(stakeCount - amount));
      dispatch(setVIPCount(vipCount + amount));
      toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
    } catch(err) {
      toast.error(err.message);
    } finally {
      setIsUnstaking(false);
    }
  }

  const onAmountChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0) {
      setAmount(parseInt(e.target.value));
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (!user.connectingWallet && user.membershipContract) {
      try {
        const isApproved = await user.membershipContract.isApprovedForAll(user.address, user.stakeContract.address);
        setIsApproved(isApproved);

        const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
        const curPoolAddress = await user.stakeContract.currentPoolId();
        setCurrentPoolId(curPoolAddress);
      } catch (e) {
        console.log(e);
      } finally {
        setIsInitializing(false);
      }
    }
  }, [user.connectingWallet]);

  const PromptToPurchase = () => {
    return (
      <p className="text-center" style={{color: 'black'}}>
        You do not have any VIP Founding Member NFTs. Pick some up in the <a href="/collection/vip-founding-member" className="fw-bold">secondary marketplace</a>.
      </p>
    )
  };

  const DynamicBattery = () => {
    if (!(stakeCount + vipCount > 0)) return <FontAwesomeIcon icon={faBatteryEmpty} />;

    const percent = stakeCount / (stakeCount + vipCount);
    if (percent >= 1) return <FontAwesomeIcon icon={faBatteryFull} />;
    if (percent >= 0.75) return <FontAwesomeIcon icon={faBatteryThreeQuarters} />;
    else if (percent >= 0.5) return <FontAwesomeIcon icon={faBatteryHalf} />;
    else if (percent > 0) return <FontAwesomeIcon icon={faBatteryQuarter} />;
    else return <FontAwesomeIcon icon={faBatteryEmpty} />;
  };

  return (
    <>
      <section className="container no-top">
        <div className="row mt-md-5 pt-md-4">
          <div className="col-md-4 text-center">
            <img src="/img/drops/vip/drop.webp" className="img-fluid img-rounded mb-sm-30" alt="VIP Founding Member Staking"/>
          </div>
          <div className="col-md-8">
            <div className="item_info">
              <h2>VIP Founding Member Staking</h2>
              <div className="my-2">Earn rewards generated through platform sales. <a href="https://blog.ebisusbay.com/founding-member-vip-staking-6f7405a68eed" className="fw-bold" target="_blank">Learn More <FontAwesomeIcon icon={faExternalLinkAlt} /></a></div>
              {isApproved && (
                <div className="item_info_counts">
                  <div>
                    <DynamicBattery /> VIPs Staked {stakeCount}
                  </div>
                  <div>
                    <FontAwesomeIcon icon={faBolt} /> VIPs Available: {vipCount}
                  </div>
                </div>
              )}

              <div className="alert alert-warning d-flex align-items-center" role="alert">
                <FontAwesomeIcon size="md" icon={faExclamationTriangle} className="me-3"/>
                <div>Harvestable rewards must be harvested before the next epoch, otherwise they will be forefited back to the rewards pool!</div>
              </div>

              <div className="spacer-20"></div>

              {!isInitializing && isApproved && (
                <>
                  {(stakeCount + vipCount) > 0 ? (
                      <>
                        <div className="row g-3">
                          <RewardsCard />
                          <div>
                            <div className="card eb-nft__card h-100 shadow px-4">
                              <div className="card-body d-flex flex-column">
                                <h5>Stake</h5>

                                {currentPoolId && (
                                    <p>Stake additional VIPs to accumulate rewards during the next epoch {currentPoolId ? `(${parseInt(currentPoolId) + 1})` : ''}.</p>
                                )}
                                <p><strong>VIPs staked for the next epoch</strong>: {stakeCount}</p>

                                <div className="row row-cols-1 g-3">
                                  <div>
                                    <Form.Label>Quantity</Form.Label>
                                    <Form.Control
                                        type="number"
                                        placeholder="Input the amount"
                                        onChange={onAmountChange}
                                        value={amount}
                                        style={{width:'80px', marginBottom: 0, appearance:'none', margin: 0}}
                                    />
                                  </div>

                                  <div className="btn-group mt-4 flex-wrap">
                                    <button className="btn-main lead mx-1 mb-2" onClick={stake} disabled={amount ===0 || vipCount === 0}>
                                      {isStaking ? (
                                          <>
                                            Staking...
                                            <Spinner animation="border" role="status" size="sm" className="ms-1">
                                              <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                          </>
                                      ) : (
                                          <>Stake</>
                                      )}
                                    </button>
                                    <button className="btn-main lead mx-1 mb-2" onClick={unStake} disabled={amount === 0 || stakeCount === 0}>
                                      {isUnstaking ? (
                                          <>
                                            UnStaking...
                                            <Spinner animation="border" role="status" size="sm" className="ms-1">
                                              <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                          </>
                                      ) : (
                                          <>UnStake</>
                                      )}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </>
                  ):(
                      <PromptToPurchase />
                  )}
                </>
              )}
              {!isInitializing && !isApproved && (

                  <div className="card eb-nft__card h-100 shadow px-4">
                    <div className="card-body d-flex flex-row justify-content-center">
                      <span className="my-auto">
                        <button className="btn-main lead me-2" onClick={approve}>
                          {isApproving ? (
                              <>
                                Approving...
                                <Spinner animation="border" role="status" size="sm" className="ms-1">
                                  <span className="visually-hidden">Loading...</span>
                                </Spinner>
                              </>
                          ) : (
                              <>Approve</>
                          )}
                        </button>
                      </span>
                      <span className="my-auto text-center">Please approve the staking contract to continue</span>
                    </div>
                  </div>
              )}

              {isInitializing && (
                  <div className="text-center">
                    <Spinner animation="border" role="status" className="ms-1">
                      <span className="visually-hidden">Loading...</span>
                    </Spinner>
                  </div>
              )}
            </div>
          </div>
        </div>
      </section>

    </>  
  );
};

export default memo(MyStaking);


const StakeCard = ({}) => {
  const [isLoading, setIsLoading] = useState(false);

}

const RewardsCard = ({}) => {
  const user = useSelector((state) => state.user);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [inInitMode, setIsInInitMode] = useState(false);
  const [isAwaitingRollover, setIsAwaitingRollover] = useState(false);
  const [totalUserStaked, setTotalUserStaked] = useState(0);

  // Current pool state
  const [cupIsLoading, setCupIsLoading] = useState(false);
  const [cupUserShares, setCupUserShares] = useState(0);
  const [cupPoolRewards, setCupPoolRewards] = useState(0);
  const [cupUserRewards, setCupUserRewards] = useState(0);
  const [cupPeriodEnd, setCupPeriodEnd] = useState(0);
  const [cupId, setCupId] = useState(0);

  // Completed pool state
  const [cmpIsLoading, setCmpIsLoading] = useState(false);
  const [cmpUserShares, setCmpUserShares] = useState(0);
  const [cmpUserRewards, setCmpUserRewards] = useState(0);
  const [cmpHasHarvested, setCmpHasHarvested] = useState(false);

  const getCompletedPoolInfo = async() => {
    if (!user.stakeContract) return;

    setCmpIsLoading(true);
    try {
      const completedPool = await user.stakeContract.completedPool();
      if (completedPool !== ethers.constants.AddressZero) {
        const rewardsContract = new Contract(completedPool, RewardsPoolAbi, user.provider.getSigner());
        const finalBalance = await rewardsContract.finalBalance();
        const share = await rewardsContract.shares(user.address);
        const totalShares = await rewardsContract.totalShares();
        const balance = finalBalance.mul(share).div(totalShares);
        const released = await rewardsContract.released(user.address);

        setCmpUserShares(share.toNumber());
        setCmpHasHarvested(released.gt(0));
        setCmpUserRewards(ethers.utils.formatEther(balance));
      }
    } catch (error) {
      console.log(error)
    } finally {
      setCmpIsLoading(false);
    }
  }

  const getCurrentPoolInfo = async() => {
    if (!user.stakeContract) return;
    setCupIsLoading(true);
    try {
      const currentPool = await user.stakeContract.curPool();
      if (currentPool === ethers.constants.AddressZero) {
        setIsInInitMode(true);
        return;
      }
      const end = await user.stakeContract.periodEnd();
      const poolBalance = await user.provider.getBalance(currentPool);
      const rewardsContract = new Contract(currentPool, RewardsPoolAbi, user.provider.getSigner());
      const userShares = await rewardsContract.shares(user.address);
      const curPoolId = await user.stakeContract.currentPoolId();
      const poolShares = await rewardsContract.totalShares();
      const balance = poolBalance.mul(userShares).div(poolShares);

      setCupUserRewards(ethers.utils.formatEther(balance));
      setCupId(curPoolId.toNumber());
      setCupUserShares(userShares.toNumber());
      setCupPoolRewards(ethers.utils.formatEther(poolBalance));
      setCupPeriodEnd(end.toNumber() * 1000);
      setIsAwaitingRollover(end.toNumber() * 1000 < Date.now());
    } catch (error) {
      console.log(error)
    } finally {
      setCupIsLoading(false);
    }
  }

  const harvest = async () => {
    if (!user.stakeContract) return;

    try {
      setIsHarvesting(true);
      const completedPool = await user.stakeContract.completedPool();
      if (completedPool !== ethers.constants.AddressZero) {
        const rewardsContract = new Contract(completedPool, RewardsPoolAbi, user.provider.getSigner());

        try {
          const released = await rewardsContract.released(user.address);

          if (released > 0) {
            toast.error("Already released");
          } else {
            const share = await rewardsContract.shares(user.address);

            if (share > 0) {
              try {
                const tx = await user.stakeContract.harvest(user.address, txExtras);
                const receipt = await tx.wait();
                getCurrentPoolInfo();
                getCompletedPoolInfo();
                toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
              } catch(err) {
                toast.error(err.message);
              }
            } else {
              toast.error("No shares");
            }
          }
        } catch(err) {
          console.log({err})
          toast.error("No harvest available");
        }
      }
    } catch(err) {
      toast.error(err.message);
    } finally {
      setIsHarvesting(false);
    }
  }

  useEffect(() => {
    getCurrentPoolInfo();
    getCompletedPoolInfo();
  }, [])

  const EpochCountdown = ({timestamp}) => {
    return (
        <Countdown date={timestamp} />
    )
  };

  return (
      <div className="row row-cols-1 row-cols-xl-2 gx-2 gy-3 gy-xl-0">
            <>
              <div className="col">
                <div className="card eb-nft__card h-100 shadow px-4">
                  <div className="card-body d-flex flex-column">
                    <h5>Rewards</h5>
                    {!inInitMode && (
                      <div className="item_info_counts">
                        <div>
                          <FontAwesomeIcon icon={faTrophy} /> VIPs Rewarded: {cmpUserShares}
                        </div>
                      </div>
                    )}
                    {cmpIsLoading ? (
                      <Spinner animation="border" role="status" size="sm" className="ms-1">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    ):(
                      <>
                        {inInitMode ? (
                            <p className="text-center my-auto">Rewards will start once the first epoch is complete</p>
                        ) : (
                            <>
                              {isAwaitingRollover ? (
                                  <p className="text-center my-auto">Calculating rewards. Please wait...</p>
                              ) : (
                                  <>
                                    {cupId > 1 ? (
                                        <p className="text-center my-xl-auto">You have <strong>{cmpHasHarvested ? 0 : commify(round(cmpUserRewards, 3))} CRO</strong> available for harvest from epoch {cupId - 1}.</p>
                                    ) : (
                                        <p className="text-center my-auto">Rewards will be harvestable once the first epoch is completed.</p>
                                    )}
                                    <button className="btn-main lead mx-1 mb-1 mt-auto" onClick={harvest} disabled={cmpHasHarvested || !(cmpUserShares > 0)} style={{width:'auto'}}>
                                      {isHarvesting ? (
                                          <>
                                            Harvesting...
                                            <Spinner animation="border" role="status" size="sm" className="ms-1">
                                              <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                          </>
                                      ) : (
                                          <>
                                            {cmpHasHarvested ? (
                                                <>Harvest in <EpochCountdown timestamp={cupPeriodEnd} /></>
                                            ) : (
                                                <>Harvest</>
                                            )}
                                          </>
                                      )}
                                    </button>
                                  </>
                              )}
                            </>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="col">
                <div className="card eb-nft__card h-100 shadow px-4">
                  <div className="card-body d-flex flex-column">
                    <h5>Current Pool</h5>
                    {!inInitMode && (
                        <div className="item_info_counts">
                          <div>
                            <FontAwesomeIcon icon={faChargingStation} /> VIPs Eligible: {cupUserShares}
                          </div>
                        </div>
                    )}
                    {cupIsLoading ? (
                      <Spinner animation="border" role="status" size="sm" className="ms-1">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    ):(
                        <>
                          {inInitMode ? (
                              <p className="text-center my-auto">Waiting for the first epoch to begin</p>
                          ) : (
                              <>
                                {isAwaitingRollover ? (
                                    <p className="text-center my-auto">Epoch {cupId} has ended. The next epoch will start soon.</p>
                                ) : (
                                    <>
                                      <p><strong>Current Epoch</strong>: {cupId}</p>
                                      <p><strong>Pool Balance</strong>: {round(cupPoolRewards, 3)} CRO</p>
                                      <p><strong>My Balance</strong>: {round(cupUserRewards, 3)} CRO</p>
                                      <div className="eb-de_countdown text-center">
                                        Ends In: <EpochCountdown timestamp={cupPeriodEnd} />
                                      </div>
                                    </>
                                )}
                              </>
                          )}

                        </>
                    )}
                  </div>
                </div>
              </div>
            </>

      </div>
  )
}