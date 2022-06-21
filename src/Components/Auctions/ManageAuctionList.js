import React, { useEffect, useState } from 'react';
import {BigNumber, constants, ethers} from 'ethers';
import AuctionContract from '../../Contracts/DegenAuction.json';
import { sortAndFetchAuctions } from '../../core/api';
import Clock from '../components/Clock';
import Link from 'next/link';
import { auctionState } from '../../core/api/enums';
import { Auction } from '../../core/models/auction';
import { commify } from 'ethers/lib/utils';
import {Form, Spinner} from "react-bootstrap";
import {
  caseInsensitiveCompare,
  createSuccessfulTransactionToastContent,
  isEventValidNumber,
  secondsToDhms
} from "../../utils";
import {useDispatch, useSelector} from "react-redux";
import {toast} from "react-toastify";
import MetaMaskOnboarding from "@metamask/onboarding";
import {chainConnect, connectAccount} from "../../GlobalState/User";
import {appConfig} from "../../Config";

const config = appConfig();

const ManageAuctionList = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const [activeAuctions, setActiveAuctions] = useState([]);
  const [unwithdrawnAuctions, setUnwithdrawnAuctions] = useState([]);
  const [openStartConfirmationDialog, setStartConfirmationDialog] = useState(false);
  const [formError, setFormError] = useState(null);
  const [runTime, setRunTime] = useState(0);
  const [selectedAuction, setSelectedAuction] = useState(null);
  const [executingStart, setExecutingStart] = useState(false);
  const [dateLabel, setDateLabel] = useState(null);

  const showConfirmationDialog = (auction) => {
    setSelectedAuction(auction);
    setStartConfirmationDialog(true);
  };
  const hideConfirmationDialog = () => {
    setDateLabel(null);
    setFormError(null);
    setSelectedAuction(null);
    setStartConfirmationDialog(false);
  };

  const handleChangeRunTime = (event) => {
    const { value } = event.target;
    const newRunTime = !isNaN(parseFloat(value)) ? parseFloat(value) : 0;
    setRunTime(newRunTime);

    let date = new Date(null);
    date.setSeconds(newRunTime);
    setDateLabel(secondsToDhms(newRunTime));
  };

  const validateRunTime = (value) => {
    setFormError(null);
    const newRunTime = !isNaN(parseFloat(value)) ? parseFloat(value) : 0;

    try {
      BigNumber.from(newRunTime);
    } catch (error) {
      setFormError('Run time is too large');
      return false;
    }

    if (newRunTime < 3600) {
      setFormError('Run time must be greater than 1 hour');
      return false;
    } else {
      return true;
    }
  };

  useEffect(() => {
    async function fetchData() {
      const response = await sortAndFetchAuctions();
      if (response.auctions === undefined) response.auctions = [];
      const auctions = response.auctions
        .filter((a) => [auctionState.NOT_STARTED, auctionState.ACTIVE].includes(a.state))
        .map((o) => new Auction(o));
      setActiveAuctions(auctions);
      const otherAuctions = response.auctions
        .filter((a) => {
          const isCompleted = ![auctionState.NOT_STARTED, auctionState.ACTIVE].includes(a.state);
          const hasUnwithdrawn = a.bidHistory.some(b => !b.withdrawn && !caseInsensitiveCompare(b.bidder, a.highestBidder));
          const afterTestAuctions = a.timeStarted > 1653891957;
          return isCompleted && hasUnwithdrawn && afterTestAuctions;
        })
        .map((o) => {
          o.unwithdrawnCount = o.bidHistory.filter(b => !b.withdrawn).length;
          return new Auction(o)
        })
        .sort((a, b) => a.endAt < b.endAt ? 1 : -1);
      console.log(otherAuctions);
      setUnwithdrawnAuctions(otherAuctions);
    }
    fetchData();
  }, []);

  const handleStartClick = async () => {
    console.log(selectedAuction.getAuctionHash, selectedAuction.getAuctionIndex, runTime);
    const validation = validateRunTime(runTime);
    if (!validation) {
      return;
    }

    if (user.address) {
      let writeContract = await new ethers.Contract(
        config.contracts.madAuction,
        AuctionContract.abi,
        user.provider.getSigner()
      );
      try {
        setExecutingStart(true);
        const tx = await writeContract.start(selectedAuction.getAuctionHash, selectedAuction.getAuctionIndex, runTime);
        const receipt = await tx.wait();
        toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
        hideConfirmationDialog();
      } catch (error) {
        console.log(error);
      } finally {
        setExecutingStart(false);
      }
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

  const mapStateToHumanReadable = (listing) => {
    switch (listing.state) {
      case auctionState.NOT_STARTED:
        return 'Not Started';
      case auctionState.ACTIVE:
        return listing.getEndAt < Date.now() ? 'Awaiting Acceptance' : 'Active';
      case auctionState.CANCELLED:
        return 'Cancelled';
      case auctionState.SOLD:
        return 'Sold';
      default:
        return 'Unknown';
    }
  };

  const handleReturnBids = async (auction) => {
    if (user.address) {
      let writeContract = await new ethers.Contract(
        config.contracts.madAuction,
        AuctionContract.abi,
        user.provider.getSigner()
      );
      try {
        setExecutingStart(true);
        const tx = await writeContract.returnBidsToWallets(auction.getAuctionHash, auction.getAuctionIndex);
        const receipt = await tx.wait();
        toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
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
        setExecutingStart(false);
      }
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

  /* const handleCancelClick = (auction) => async () => {
    if (user.address) {
      let writeContract = await new ethers.Contract(
        config.auction_contract,
        AuctionContract.abi,
        user.provider.getSigner()
      );
      console.log('cancelling auction...', auction);
      try {
        const tx = await writeContract.cancel(auction.auctionHash);
        const receipt = await tx.wait();
        toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
      } catch (error) {
        console.log(error);
      }
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
  };*/

  return (
    <div>
      <h2>Active Auctions</h2>
      <div className="card-group mb-4">
        {activeAuctions?.length > 0 ? (
          <>
            activeAuctions.map((auction, index) => (
            <div key={index} className="d-item col-xl-3 col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4 px-2">
              <div className="card eb-nft__card h-100 shadow">
                <img src={auction.nft.image} className={`card-img-top marketplace`} alt={auction.nft.name} />
                <div className="eb-de_countdown text-center">
                  Ends In:
                  {auction.state !== auctionState.NOT_STARTED ? (
                    <Clock deadline={auction.getEndAt} />
                  ) : (
                    <div className="fw-bold">Not Started</div>
                  )}
                </div>
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title mt-auto">{auction.nft.name}</h6>
                  <p className="card-text">
                    {commify(auction.getHighestBid)} MAD <br />
                    State: {mapStateToHumanReadable(auction)}
                  </p>
                </div>
                <div className="card-footer d-flex justify-content-between">
                  <Link href={`/auctions/${auction.getAuctionId}`}>
                    <a>View</a>
                  </Link>
                  {auction.state === auctionState.NOT_STARTED && (
                    <span className="cursor-pointer" onClick={() => showConfirmationDialog(auction)}>Start</span>
                  )}
                </div>
              </div>
            </div>
            ))}
          </>
        ) : (
          <>No active auctions</>
        )}
      </div>
      <h2>Complete Unwithdrawn Auctions</h2>
      <div className="card-group">
        {unwithdrawnAuctions &&
          unwithdrawnAuctions.map((auction, index) => (
            <div key={index} className="d-item col-xl-3 col-lg-4 col-md-6 col-sm-6 col-xs-12 mb-4 px-2">
              <div className="card eb-nft__card h-100 shadow">
                <img src={auction.nft.image} className={`card-img-top marketplace`} alt={auction.nft.name} />
                <div className="card-body d-flex flex-column">
                  <h6 className="card-title mt-auto">{auction.nft.name}</h6>
                  <p className="card-text">
                    {commify(auction.getHighestBid)} MAD <br />
                    State: {mapStateToHumanReadable(auction)}
                  </p>
                </div>
                <div className="card-footer d-flex justify-content-between">
                  <Link href={`/auctions/${auction.getAuctionId}`}>
                    <a>View</a>
                  </Link>
                  <span className="cursor-pointer" onClick={() => handleReturnBids(auction)}>Return {auction.unwithdrawnCount} Bids</span>
                </div>
              </div>
            </div>
          ))}
      </div>
      {openStartConfirmationDialog && user && (
        <div className="checkout">
          <div className="maincheckout">
            <button className="btn-close" onClick={hideConfirmationDialog}>
              x
            </button>
            <div className="heading">
              <h3>Confirm Auction Start</h3>
            </div>
            <p>Start auction and specify how long it should run for.</p>
            <div className="heading mt-3">
              <p>Run Time (in seconds)</p>
              <div className="subtotal">
                <Form.Control
                  className="mb-0"
                  type="text"
                  placeholder="Enter Bid"
                  onChange={handleChangeRunTime}
                  onKeyDown={(e) => {
                    if (!isEventValidNumber(e)) {
                      e.preventDefault();
                    }
                  }}
                />
              </div>
            </div>
            {formError && (
              <div
                className="error"
                style={{
                  color: 'red',
                  marginLeft: '5px',
                }}
              >
                {formError}
              </div>
            )}

            <div className="heading">
              <p>Formatted Run Time</p>
              <div className="subtotal">{dateLabel}</div>
            </div>

            <button
              className="btn-main lead mb-5"
              onClick={handleStartClick}
              disabled={executingStart}
            >
              {executingStart ? (
                <>
                  Starting...
                  <Spinner animation="border" role="status" size="sm" className="ms-1">
                    <span className="visually-hidden">Loading...</span>
                  </Spinner>
                </>
              ) : (
                <>Start Auction</>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default ManageAuctionList;
