import React, { memo, useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStakeCount, setVIPCount } from '../../GlobalState/User';
import { Form, Spinner } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { createSuccessfulTransactionToastContent, round, siPrefixedNumber } from '../../utils';
import { ethers } from 'ethers';
// import { RewardsPoolAbi } from '../../Contracts/Abis';
// import config from '../../Assets/networks/rpc_config.json';
// import { commify } from 'ethers/lib.esm/utils';
// import Countdown from 'react-countdown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBatteryEmpty,
  faBatteryFull,
  faBatteryHalf,
  faBatteryQuarter,
  faBatteryThreeQuarters,
  faBolt,
  faExternalLinkAlt,
  // faChargingStation,
  // faExclamationTriangle,
  // faTrophy,
} from '@fortawesome/free-solid-svg-icons';
import { getTheme } from '../../Theme/theme';

const txExtras = {
  gasPrice: ethers.utils.parseUnits('5000', 'gwei'),
};

const MyStaking = () => {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const stakeCount = user.stakeCount;
  const vipCount = user.vipCount;
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
  };

  const stake = async (quantity) => {
    if (!user.stakeContract || quantity === 0) return;
    if (quantity > vipCount) {
      toast.error('You do not have enough available VIPs');
      return;
    }
    try {
      if (!isApproved) await approve();
      const tx = await user.stakeContract.stake(quantity, txExtras);
      const receipt = await tx.wait();
      dispatch(setStakeCount(stakeCount + quantity));
      dispatch(setVIPCount(vipCount - quantity));
      toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
    } catch (err) {
      toast.error(err.message);
    }
  };

  const unStake = async (quantity) => {
    if (!user.stakeContract || quantity <= 0) return;
    if (quantity > stakeCount) {
      toast.error('You do not have enough available VIPs');
      return;
    }
    try {
      const tx = await user.stakeContract.unstake(quantity, { gasPrice: 5000000000000 });
      const receipt = await tx.wait();
      dispatch(setStakeCount(stakeCount - quantity));
      dispatch(setVIPCount(vipCount + quantity));
      toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
    } catch (err) {
      toast.error(err.message);
    }
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    if (!user.connectingWallet && user.membershipContract) {
      try {
        const isApproved = await user.membershipContract.isApprovedForAll(user.address, user.stakeContract.address);
        setIsApproved(isApproved);
      } catch (e) {
        console.log(e);
      } finally {
        setIsInitializing(false);
      }
    }
    // eslint-disable-next-line
  }, [user.connectingWallet]);

  const PromptToPurchase = () => {
    return (
      <p className="text-center" style={{ color: 'black' }}>
        You do not have any VIP Founding Member NFTs. Pick some up in the{' '}
        <a href="/collection/vip-founding-member" className="fw-bold">
          secondary marketplace
        </a>
      </p>
    );
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
            <img
              src="/img/drops/vip/drop.webp"
              className="img-fluid img-rounded mb-sm-30"
              alt="VIP Founding Member Staking"
            />
          </div>
          <div className="col-md-8">
            <div className="item_info">
              <h2>VIP Founding Member Staking</h2>
              <div className="my-2">
                Earn rewards generated through platform sales.{' '}
                <a
                  href="https://blog.ebisusbay.com/founding-member-vip-staking-6f7405a68eed"
                  className="fw-bold"
                  target="_blank"
                  rel="noreferrer"
                >
                  Learn More <FontAwesomeIcon icon={faExternalLinkAlt} />
                </a>
              </div>
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

              <div className="spacer-20"></div>

              {!isInitializing && isApproved && (
                <>
                  {stakeCount + vipCount > 0 ? (
                    <>
                      <div className="row g-3">
                        <RewardsCard />
                        <div>
                          <div className="row g-3">
                            <div className="col-12 col-sm-6">
                              <StakeCard
                                buttonName="Stake"
                                buttonActionName="Staking..."
                                threshold={vipCount}
                                stake={stake}
                              />
                            </div>
                            <div className="col-12 col-sm-6">
                              <StakeCard
                                buttonName="Unstake"
                                buttonActionName="Unstaking..."
                                threshold={stakeCount}
                                stake={unStake}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
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

const StakeCard = ({ stake, threshold, buttonName, buttonActionName }) => {
  const [quantity, setQuantity] = useState(1);
  const [isStaking, setIsStaking] = useState(false);

  const onAmountChange = (e) => {
    const value = parseInt(e.target.value);
    if (value > 0 && value <= threshold) {
      setQuantity(parseInt(e.target.value));
    }
  };

  const execute = async () => {
    try {
      setIsStaking(true);
      await stake(quantity);
    } finally {
      setIsStaking(false);
    }
  };

  useEffect(() => {
    if (quantity > threshold) {
      setQuantity(threshold);
    } else if (quantity === 0 && threshold > 0) {
      setQuantity(1);
    }
    // eslint-disable-next-line
  }, [threshold]);

  return (
    <div className="card eb-nft__card h-100 shadow px-4">
      <div className="card-body d-flex flex-column">
        <h5>{buttonName}</h5>
        <div className="row row-cols-1 g-3">
          <div>
            <Form.Label>Quantity</Form.Label>
            <Form.Control
              type="number"
              placeholder="Input the amount"
              onChange={onAmountChange}
              value={quantity}
              style={{ width: '80px', marginBottom: 0, appearance: 'none', margin: 0 }}
            />
          </div>

          <div className="btn-group mt-4 flex-wrap">
            <button className="btn-main lead mx-1 mb-2" onClick={execute} disabled={quantity === 0 || threshold === 0}>
              {isStaking ? (
                <>
                  {buttonActionName}
                  <Spinner animation="border" role="status" size="sm" className="ms-1">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </>
              ) : (
                <>{buttonName}</>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const RewardsCard = () => {
  const user = useSelector((state) => state.user);
  const userTheme = useSelector((state) => {
    return state.user.theme;
  });

  const [isHarvesting, setIsHarvesting] = useState(false);
  const [rewardsInfoLoading, setRewardsInfoLoading] = useState(false);
  const [userPendingRewards, setUserPendingRewards] = useState(0);
  const [userReleasedRewards, setUserReleasedRewards] = useState(0);
  const [globalPaidRewards, setGlobalPaidRewards] = useState(0);
  const [globalStakedTotal, setglobalStakedTotal] = useState(0);

  const getRewardsInfo = async () => {
    if (!user.stakeContract) return;

    setRewardsInfoLoading(true);
    try {
      const mGlobalStakedTotal = await user.stakeContract.totalStaked();
      setglobalStakedTotal(parseInt(mGlobalStakedTotal));

      const mUserPendingRewards = await user.stakeContract.getReward(user.address);
      const mGlobalPaidRewards = await user.stakeContract.rewardsPaid();
      const mUserReleasedRewards = await user.stakeContract.getReleasedReward(user.address);

      setUserPendingRewards(ethers.utils.formatEther(mUserPendingRewards));
      setUserReleasedRewards(ethers.utils.formatEther(mUserReleasedRewards));
      setGlobalPaidRewards(ethers.utils.formatEther(mGlobalPaidRewards));
    } catch (error) {
      console.log(error);
    } finally {
      setRewardsInfoLoading(false);
    }
  };

  const harvest = async () => {
    if (!user.stakeContract) return;

    try {
      setIsHarvesting(true);
      const amountToHarvest = await user.stakeContract.getReward(user.address);

      if (amountToHarvest.gt(0)) {
        try {
          const tx = await user.stakeContract.harvest(user.address, txExtras);
          const receipt = await tx.wait();
          await getRewardsInfo();
          toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
        } catch (err) {
          toast.error(err.message);
        }
      } else {
        toast.error('Amount to harvest is zero');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsHarvesting(false);
    }
  };

  useEffect(() => {
    async function func() {
      await getRewardsInfo();
    }
    func();
    // eslint-disable-next-line
  }, []);

  return (
    <div className="col">
      <div className="card eb-nft__card h-100 shadow px-4">
        <div className="card-body d-flex flex-column">
          <h5>Rewards</h5>
          {rewardsInfoLoading ? (
            <Spinner animation="border" role="status" size="sm" className="ms-1">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : (
            <>
              <div className="row mb-4">
                <div className="col-12 col-sm-4 text-center">
                  <div>Total Staked</div>
                  <div className="fw-bold" style={{ color: getTheme(userTheme).colors.textColor3 }}>
                    {globalStakedTotal}
                  </div>
                </div>
                <div className="col-12 col-sm-4 text-center">
                  <div>Total Harvested</div>
                  <div className="fw-bold" style={{ color: getTheme(userTheme).colors.textColor3 }}>
                    {siPrefixedNumber(Number(globalPaidRewards))} CRO
                  </div>
                </div>
                <div className="col-12 col-sm-4 text-center">
                  <div>My Share</div>
                  <div className="fw-bold" style={{ color: getTheme(userTheme).colors.textColor3 }}>
                    {siPrefixedNumber(Number(userReleasedRewards))} CRO
                  </div>
                </div>
              </div>
              {userPendingRewards > 0 ? (
                <>
                  <p className="text-center my-auto">Waiting for harvest season...</p>
                  {/*<p className="text-center my-xl-auto fs-5" style={{color: getTheme(userTheme).colors.textColor3}}>*/}
                  {/*  You have <strong>{commify(round(userPendingRewards, 3))} CRO</strong>{' '}*/}
                  {/*  available for harvest!*/}
                  {/*</p>*/}
                  {/*<button*/}
                  {/*  className="btn-main lead mx-1 mb-1 mt-2"*/}
                  {/*  onClick={harvest}*/}
                  {/*  disabled={!(userPendingRewards > 0)}*/}
                  {/*  style={{ width: 'auto' }}*/}
                  {/*>*/}
                  {/*  {isHarvesting ? (*/}
                  {/*    <>*/}
                  {/*      Harvesting...*/}
                  {/*      <Spinner animation="border" role="status" size="sm" className="ms-1">*/}
                  {/*        <span className="visually-hidden">Loading...</span>*/}
                  {/*      </Spinner>*/}
                  {/*    </>*/}
                  {/*  ) : (*/}
                  {/*    <>Harvest</>*/}
                  {/*  )}*/}
                  {/*</button>*/}
                </>
              ) : (
                // <p className="text-center my-auto">
                //   No harvestable rewards yet. Check back later!
                // </p>
                <p className="text-center my-auto">Waiting for harvest season...</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
