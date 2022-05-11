import React, { useState } from 'react';
import Blockies from 'react-blockies';
import { createSuccessfulTransactionToastContent, shortAddress, timeSince } from 'src/utils';
import { Link, useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
// import { listingUpdated } from '../../../../GlobalState/listingSlice';
import { toast } from 'react-toastify';
import MetaMaskOnboarding from '@metamask/onboarding';
import { chainConnect, connectAccount } from '../../../../GlobalState/User';
import { useDispatch, useSelector } from 'react-redux';
import { Spinner } from 'react-bootstrap';
import { getNftDetails } from '../../../../GlobalState/nftSlice';

export default function ListingsRow({ listing }) {
  const dispatch = useDispatch();
  const history = useHistory();

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
          <Link className='avatar' to={`/seller/${listing.seller}`}>
            <div className="p_list_pp" style={{ zIndex: 1 }}>
              <span>
                <span onClick={viewSeller(listing.seller)}>
                  <Blockies seed={listing.seller} size={10} scale={5} />
                </span>
              </span>
            </div>
          </Link>
          <div className="p_list_info">
            <span>{timeSince(listing.listingTime + '000')} ago</span>
            Listed by{' '}
            <b>
              <Link to={`/seller/${listing.seller}`}>{shortAddress(listing.seller)}</Link>
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
