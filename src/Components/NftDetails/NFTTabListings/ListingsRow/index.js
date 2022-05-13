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

  const viewSeller = (seller) => () => {
    history.push(`/seller/${seller}`);
  };

  return (
    <div className="p_list">
      <div className="row">
        <div className="col-8">
          <Link href={`/seller/${listing.seller}`}>
            <a>
              <div className="p_list_pp" style={{ zIndex: 1 }}>
                <span>
                  <span onClick={viewSeller(listing.seller)}>
                    <Blockies seed={listing.seller} size={10} scale={5} />
                  </span>
                </span>
              </div>
            </a>
          </Link>
          <div className="p_list_info">
            <span>{timeSince(listing.listingTime + '000')} ago</span>
            Listed by{' '}
            <b>
              <Link href={`/seller/${listing.seller}`}>
                <a>{shortAddress(listing.seller)}</a>
              </Link>
            </b>{' '}
            for <b>{ethers.utils.commify(listing.price)} CRO</b>
          </div>
        </div>
        <div className="col-4">
          <button className="btn-main" onClick={executeBuy(listing.price)} disabled={executingBuy}>
            {executingBuy ? (
              <>
                Buy Now...
                <Spinner animation="border" role="status" size="sm" className="ms-1">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </>
            ) : (
              <>Buy Now</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
