import React, { useState } from 'react';
import Blockies from 'react-blockies';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import MetaMaskOnboarding from '@metamask/onboarding';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';

import { createSuccessfulTransactionToastContent, shortAddress, timeSince } from '../../../../utils';
import { chainConnect, connectAccount } from '../../../../GlobalState/User';
import { getNftDetails } from '../../../../GlobalState/nftSlice';
import ListingItem from '../ListingItem';

export default function ListingsRow({ listing }) {
  const dispatch = useDispatch();
  const history = useRouter();

  const user = useSelector((state) => state.user);

  const [executingBuy, setExecutingBuy] = useState(false);

  const executeBuy = (amount) => async () => {
    setExecutingBuy(true);
    await runFunction(async (writeContract) => {
      let price = ethers.utils.parseUnits(amount.toString());
      return (
        await writeContract.makePurchase(listing.listingId, {
          value: price,
        })
      ).wait();
    });
    setExecutingBuy(false);
  };

  const runFunction = async (fn) => {
    if (user.address) {
      try {
        const receipt = await fn(user.marketContract);
        dispatch(getNftDetails(listing.nftAddress, listing.nftId));
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

  return (
    <ListingItem
      route="/seller"
      buttonText="Buy Now"
      primaryTitle="Listed by"
      user={listing.seller}
      time={timeSince(listing.listingTime + '000')}
      price={ethers.utils.commify(listing.price)}
      primaryText={shortAddress(listing.seller)}
      onClick={executeBuy(listing.price)}
      isProcessing={executingBuy}
    />
  );
}
