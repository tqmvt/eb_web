import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { createSuccessfulTransactionToastContent } from '../../utils';
import { Card, Form, Spinner } from 'react-bootstrap';
import MetaMaskOnboarding from '@metamask/onboarding';
import { chainConnect, connectAccount } from '../../GlobalState/User';
import { listingUpdated } from '../../GlobalState/listingSlice';
import { listingState } from '../../core/api/enums';
import MakeOfferDialog from '../Offer/MakeOfferDialog';

const PriceActionBar = () => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const listing = useSelector((state) => state.nft.currentListing);
  const [executingBuy, setExecutingBuy] = useState(false);
  const [buyError, setBuyError] = useState('');

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
        dispatch(
          listingUpdated({
            listing: {
              ...listing,
              state: 1,
              purchaser: user.address,
            },
          })
        );
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
    <div className="row">
      {listing && (
        <Card
          id={`lid-${listing.listingId}`}
          className="mb-4 border-1 shadow"
          style={{ color: '#141619', borderColor: '#cdcfcf' }}
        >
          <Card.Body>
            <div className="d-flex flex-row justify-content-between">
              <div className={`my-auto fw-bold`} style={{ color: '#000' }}>
                <>
                  <h5>Listing Price:</h5> <span className="fs-3 ms-1">{ethers.utils.commify(listing.price)} CRO</span>
                </>
              </div>
              <span className="my-auto">
                {listing.state === listingState.ACTIVE && (
                  <button
                    className="btn-main"
                    onClick={executeBuy(listing.price)}
                    disabled={!!buyError || executingBuy}
                  >
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
                )}
                {listing.state === listingState.SOLD && <p>SOLD</p>}
                {listing.state === listingState.CANCELLED && <p>CANCELLED</p>}
              </span>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
};
export default PriceActionBar;
