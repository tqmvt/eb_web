import React, { memo, useState, useEffect, useCallback } from 'react';
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
      toast.error("Exceed amount");
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
      alert("Exceed amount");
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

        // const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
        // const curPoolAddress = await user.stakeContract.curPool();
        // const poolContract = new Contract(curPoolAddress, RewardsPoolAbi, readProvider);
        // if (curPoolAddress !== ethers.constants.AddressZero) {
        //   const harvestableRewards = await poolContract.shares(user.address);
        //   const finalBalance = await poolContract.finalBalance();
        // }

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

  return (
    <>
      <section className="container no-top">
        <div className="row mt-md-5 pt-md-4">
          <div className="col-md-6 text-center">
            <img src="/img/drops/vip/drop.webp" className="img-fluid img-rounded mb-sm-30" alt="VIP Founding Member Staking"/>
          </div>
          <div className="col-md-6">
            <div className="item_info">
              <h2>VIP Founding Member Staking</h2>
              <div className="item_info">
                <div className="item_info_counts">
                  <div>
                    Staking {stakeCount} / {(stakeCount + vipCount)}
                  </div>
                </div>
              </div>
              <div className="mt-3">At Ebisu's Bay Marketplace, 50% of all transaction fees go towards the VIP rewards pool. Stake your VIP Founding Member NFTs today and be a part of the rewards pool.</div>

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
                  <div className="d-flex flex-wrap mt-5 justify-content-center justify-content-lg-start">
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
                    <span className="my-auto text-center">Please approve the contract before staking</span>
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
      }
      const end = await user.stakeContract.periodEnd();
      const currentBalance = await user.provider.getBalance(currentPool);
      const rewardsContract = new Contract(currentPool, RewardsPoolAbi, user.provider.getSigner());
      const currentShares = await rewardsContract.shares(user.address);
      const curPoolId = await user.stakeContract.currentPoolId();

      const totalShares = await rewardsContract.totalShares();
      const balance = currentBalance.mul(currentShares).div(totalShares);
      setCupUserRewards(balance.toNumber());

      setCupId(curPoolId.toNumber());
      setCupUserShares(currentShares.toNumber());
      setCupPoolRewards(ethers.utils.formatEther(currentBalance));
      setCupPeriodEnd(end.toNumber());
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
                await getCompletedPoolInfo();
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

  return (
      <div className="row row-cols-2 gx-2">
            <>
              <div className="col">
                <div className="card eb-nft__card h-100 shadow px-4">
                  <div className="card-body d-flex flex-column">
                    <h5>Rewards</h5>
                    {cmpIsLoading ? (
                      <Spinner animation="border" role="status" size="sm" className="ms-1">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    ):(
                      <>
                        {inInitMode ? (
                            <span>Not Started</span>
                        ) : (
                            <>
                              <p><strong>VIPs Staked</strong>: {cmpUserShares}</p>
                              {isAwaitingRollover ? (
                                  <span>Calculating rewards...</span>
                              ) : (
                                  <>
                                    {!cmpHasHarvested && (
                                        <p><strong>Harvestable Rewards</strong>: {commify(round(cmpUserRewards, 8))} CRO</p>
                                    )}
                                    <button className="btn-main lead mx-1 mb-2" onClick={harvest} disabled={cmpHasHarvested || !(cmpUserShares > 0)}>
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
                                                <>Harvest in <Countdown date={cupPeriodEnd * 1000} /></>
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
                    <h5>Current Pool ({cupId})</h5>

                    {cupIsLoading ? (
                      <Spinner animation="border" role="status" size="sm" className="ms-1">
                        <span className="visually-hidden">Loading...</span>
                      </Spinner>
                    ):(
                        <>
                          {isAwaitingRollover ? (
                              <p>Pool complete. Awaiting next pool.</p>
                          ) : (
                              <>
                                <p><strong>VIPs Staked</strong>: {cupUserShares}</p>
                                <p><strong>Pool Balance</strong>: {round(cupPoolRewards, 3)} CRO</p>
                                <p><strong>My Balance</strong>: {round(cupUserRewards, 3)} CRO</p>
                                <p><strong>Ends in</strong>: <Countdown date={cupPeriodEnd * 1000} /></p>
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