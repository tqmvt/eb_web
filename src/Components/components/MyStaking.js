import React, {memo, useEffect, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStakeCount, setVIPCount } from '../../GlobalState/User';
import {Form, Spinner} from 'react-bootstrap';
import { toast } from 'react-toastify';
import {createSuccessfulTransactionToastContent} from '../../utils';
import {ethers} from "ethers";


const MyStaking = ({ walletAddress = null }) => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const stakeCount = user.stakeCount;
  const vipCount = user.vipCount;
  const [isStaking, setIsStaking] = useState(false);
  const [isUnstaking, setIsUnstaking] = useState(false);
  const [isHarvesting, setIsHarvesting] = useState(false);
  const [amount, setAmount] = useState(1);
  const [isApproved, setIsApproved] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  const txExtras = {
    gasPrice: ethers.utils.parseUnits('5000', 'gwei'),
  }

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
        console.log(error);
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
    if (!user.stakeContract || amount ===0) return;
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

  const harvest = async () => {
    if (!user.stakeContract) return;
   
    try {
      setIsHarvesting(true);
      await user.stakeContract.harvest(walletAddress, { gasPrice: 5000000000000 });
      toast.success(createSuccessfulTransactionToastContent("Successfully harvested"));
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

  useEffect(async () => {
    if (user.membershipContract) {
      try {
        const isApproved = await user.membershipContract.isApprovedForAll(user.address, user.stakeContract.address);
        setIsApproved(isApproved);
      } catch (e) {
        setIsApproved(false);
      } finally {
        setIsInitializing(false);
      }
    }
  }, [user]);

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
                        <div className="row mt-4">
                          <Form.Label>Quantity</Form.Label>
                          <Form.Control
                              type="number"
                              placeholder="Input the amount"
                              onChange={onAmountChange}
                              value={amount}
                              style={{width:'100px', marginBottom: 0, appearance:'none', margin: 0}}
                          />
                        </div>
                        <div className="d-flex flex-wrap mt-5">
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
