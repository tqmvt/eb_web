import React, {useEffect, useState} from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import {createSuccessfulTransactionToastContent, isNftBlacklisted, isUserBlacklisted} from '../../utils';
import { Card, Spinner } from 'react-bootstrap';
import MetaMaskOnboarding from '@metamask/onboarding';
import { chainConnect, connectAccount } from '../../GlobalState/User';
import { listingUpdated } from '../../GlobalState/listingSlice';
import { listingState } from '../../core/api/enums';
import {OFFER_TYPE} from "../Offer/MadeOffersRow";
import Button from "../components/Button";

const PriceActionBar = ({offerType, onOfferSelected, label}) => {
  const dispatch = useDispatch();

  const user = useSelector((state) => state.user);
  const listing = useSelector((state) => state.nft.currentListing);
  const [executingBuy, setExecutingBuy] = useState(false);
  const [canBuy, setCanBuy] = useState(false);

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

  useEffect(() => {
    setCanBuy(listing && !isUserBlacklisted(listing.seller) && !isNftBlacklisted(listing.nftAddress, listing.nftId));
  }, [listing]);

  return (
    <div className="row price-action-bar">
      <Card className="mb-4 border-1 shadow pab-card">
        <Card.Body>
          <div id={`lid-${listing?.listingId}`}>
            <div className="d-flex flex-row justify-content-between">
              <div className={`my-auto fw-bold`}>
                <>
                  <h5>{label ?? 'Listing Price'}:</h5> <span className="fs-3 ms-1">{listing ? ethers.utils.commify(listing.price) : '-'} CRO</span>
                </>
              </div>
            </div>
          </div>

          <div className="d-flex">
            {canBuy && (
              <div className="flex-fill mx-1">
                {listing.state === listingState.ACTIVE && (
                  <Button type="legacy" className="w-100" onClick={executeBuy(listing.price)} disabled={executingBuy}>
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
                  </Button>
                )}
              </div>
            )}
            <div className="flex-fill mx-1">
                <Button type="legacy-outlined" className="w-100" onClick={onOfferSelected}>
                  {offerType === OFFER_TYPE.update ? 'Update' : 'Make'} Offer
                </Button>
            </div>
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};
export default PriceActionBar;
