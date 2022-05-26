import React, { useEffect, useState } from 'react';
// import { useDispatch, useSelector } from 'react-redux';

import { ethers } from 'ethers';
// import config from '../../Assets/networks/rpc_config.json';
// import AuctionContract from '../../Contracts/Auction.json';
// import { toast } from 'react-toastify';
// import { createSuccessfulTransactionToastContent } from '../../utils';
import { sortAndFetchAuctions } from '../../core/api';
import Clock from '../components/Clock';
// import MetaMaskOnboarding from '@metamask/onboarding';
// import { chainConnect, connectAccount } from '../../GlobalState/User';
import Link from 'next/link';
import { auctionState } from '../../core/api/enums';
import { Auction } from '../../core/models/auction';
import { commify } from 'ethers/lib/utils';

const ManageAuctionList = () => {
  // const dispatch = useDispatch();

  // const user = useSelector((state) => state.user);
  const [auctions, setAuctions] = useState([]);

  useEffect(() => {
    async function fetchData() {
      const response = await sortAndFetchAuctions();
      if (response.auctions === undefined) response.auctions = [];
      const auctions = response.auctions
        .filter((a) => [auctionState.NOT_STARTED, auctionState.ACTIVE].includes(a.state))
        .map((o) => new Auction(o));
      setAuctions(auctions);
    }
    fetchData();
  }, []);

  /* const handleStartClick = (auction) => async () => {
    if (user.address) {
      let writeContract = await new ethers.Contract(
        config.auction_contract,
        AuctionContract.abi,
        user.provider.getSigner()
      );
      try {
        const tx = await writeContract.start(auction.auctionHash);
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
      <div className="card-group">
        {auctions &&
          auctions.map((auction, index) => (
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
                    {commify(auction.getHighestBid)} CRO <br />
                    State: {mapStateToHumanReadable(auction)}
                  </p>
                </div>
                <div className="card-footer d-flex justify-content-between">
                  <Link href={`/auctions/${auction.auctionId}`}>
                    <a>View</a>
                  </Link>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
export default ManageAuctionList;
