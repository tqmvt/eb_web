import React, {memo, useEffect, useState} from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStakeCount, setVIPCount } from '../../GlobalState/User';
import { Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { createSuccessfulTransactionToastContent } from '../../utils';
import config from '../../Assets/networks/rpc_config.json';
import {ethers} from "ethers";
import {ERC721} from "../../Contracts/Abis";

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
    if (amount >= vipCount) {
      toast.error("Exceed amount");
      return;
    }
    try {
      setIsStaking(true);
      if (!isApproved) await approve();
      await user.stakeContract.stake(amount, txExtras);
      dispatch(setStakeCount(stakeCount + amount));
      dispatch(setVIPCount(vipCount - amount));
      toast.success(createSuccessfulTransactionToastContent("Successfully staked"));
    } catch(err) {
      toast.error(err.message);
    } finally {
      setIsStaking(false);
    }    
  }

  const unStake = async () => {
    if (!user.stakeContract || amount ===0) return;
    if (amount >= stakeCount) {
      alert("Exceed amount");
      return;
    }
    try {
      setIsUnstaking(true);
      await user.stakeContract.unstake(amount, { gasPrice: 5000000000000 });
      dispatch(setStakeCount(stakeCount - amount));
      dispatch(setVIPCount(vipCount + amount));
      toast.success(createSuccessfulTransactionToastContent("Successfully unstaked"));
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
    setAmount(parseInt(e.target.value));
  }

  useEffect(async () => {
    if (user.membershipContract) {
      try {
        const isApproved = await user.membershipContract.isApprovedForAll(user.address, user.stakeContract.address);
        setIsApproved(isApproved);
      } catch (e) {
        setIsApproved(false);
      }
    }
  }, [user]);

  return (
    <>
      <div className="text-center">
        <img src="/img/vip-stake.webp" alt="Ebisu's Bay VIP"/>
      </div>
      <div className="row mt-4 d-flex justify-content-center">
        <div className="col-lg-4 text-center d-flex justify-content-sm-between">
          <h4>VipCount: {vipCount} </h4>
          <h4>StakedCount: {stakeCount}</h4>
        </div>
      </div>
      <div className="row mt-4 text-center d-flex justify-content-center">  
        <div className="col-lg-2 text-center">
          <Form.Control type="number" placeholder="Input the amount" onChange={onAmountChange} value={amount}/>
        </div>
      </div>
      <div className="row mt-4">
        {isApproved && (
            <div className='col-lg-12 d-flex justify-content-center'>
              <button className="btn-main lead mx-5" onClick={stake} disabled={amount ===0 || vipCount === 0}>
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

              <button className="btn-main lead mx-5" onClick={unStake} disabled={amount === 0 || stakeCount === 0}>
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

              <button className="btn-main lead mx-5" onClick={harvest}>
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
        )}
        {!isApproved && (
            <div className="col-lg-12 d-flex justify-content-center">
              <button className="btn-main lead mx-5" onClick={approve} disabled={amount ===0 || vipCount === 0}>
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
            </div>
        )}
      </div>
    </>  
  );
};

export default memo(MyStaking);
