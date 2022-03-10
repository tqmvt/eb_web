import React, { memo, useState, useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStakeCount, setVIPCount } from '../../GlobalState/User';
import {Form, Spinner} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {createSuccessfulTransactionToastContent} from '../../utils';
import {Contract, ethers} from "ethers";
import {RewardsPoolAbi} from "../../Contracts/Abis";
import config from "../../Assets/networks/rpc_config.json";


const MyStaking = ({ walletAddress = null }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const stakeCount = user.stakeCount;
  const vipCount = user.vipCount;
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [amount, setAmount] = useState(1);
  const [harvestAmount, setHarvestAmount] = useState(0);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [inInitMode, setIsInInitMode] = useState(true);

  const txExtras = {
    gasPrice: ethers.utils.parseUnits('5000', 'gwei'),
  }
  const getHarvestAmount = useCallback(async() => {
    if (!user.stakeContract) return;
    try {
      setIsHarvesting(true);
      const completedPool = await user.stakeContract.completedPool();
      const currBalance = await user.provider.getBalance( user.stakeContract.curPool());
      const completedBalance = await user.provider.getBalance(completedPool);
      console.log({completedBalance})
      if (currBalance > 0 || completedBalance > 0) {
        setIsInInitMode(false);
      }
      if (completedPool !== ethers.constants.AddressZero) {
        const rewardsContract = new Contract(completedPool, RewardsPoolAbi, user.provider.getSigner());
        const finalBalance = await rewardsContract.finalBalance();
        if (finalBalance <= 0) {
          toast.error("Not available balance");      
        } else {
          const share = await rewardsContract.shares(walletAddress);
          const totalShares = await rewardsContract.totalShares();
          const balance = finalBalance.mul(share).div(totalShares);
          setHarvestAmount(ethers.utils.formatEther(balance));
        }          
      }
    } catch(err) {
      console.log({err})
      toast.error(err.message);
    } finally {
      setIsHarvesting(false);
    }    
  }, [user.provider, user.stakeContract, walletAddress]);

  useEffect(() => {
    getHarvestAmount();
    const harvetstInterval = setInterval(getHarvestAmount, 1000 * 60 * 60);

    return () => {
      clearInterval(harvetstInterval);
    }
  }, [getHarvestAmount])
   
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
    if (amount >= stakeCount) {
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

  const harvest = async () => {
    if (!user.stakeContract) return;
   
    try {
      setIsHarvesting(true);
      const completedPool = await user.stakeContract.completedPool();
      if (completedPool !== ethers.constants.AddressZero) {
        const rewardsContract = new Contract(completedPool, RewardsPoolAbi, user.provider.getSigner());
        try {
          const released = await rewardsContract.released(walletAddress);

          if (released > 0) {
            toast.error("Already released");      
          } else {
            const share = await rewardsContract.shares(walletAddress);

            if (share > 0) {
              try {
                await user.stakeContract.harvest(walletAddress, { gasPrice: 5000000000000 });
                toast.success(createSuccessfulTransactionToastContent("Successfully harvested"));
                await getHarvestAmount();
              } catch(err) {
                toast.error(err.message);      
              }
            } else {
              toast.error("No shares");      
            }
          }          
        } catch(err) {
          toast.error("No harvest available");    
        }
      }
    } catch(err) {
      toast.error(err.message);
    } finally {
      setIsHarvesting(false);
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
                          <div>
                            <div className="card eb-nft__card h-100 shadow px-4">
                              <div className="card-body d-flex flex-column">
                                <h5>Rewards: {harvestAmount}</h5>
                                {inInitMode ? (
                                    <span>Not Started</span>
                                ) : (
                                    <button className="btn-main lead mx-1 mb-2" onClick={harvest}>
                                      {isHarvesting ? (
                                          <>
                                            Harvesting...
                                            <Spinner animation="border" role="status" size="sm" className="ms-1">
                                              <span className="visually-hidden">Loading...</span>
                                            </Spinner>
                                          </>
                                      ) : (
                                          <>Harvest</>
                                      )}
                                    </button>
                                )}
                              </div>
                            </div>
                          </div>
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
