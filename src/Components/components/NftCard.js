import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { Link, useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import MetaMaskOnboarding from '@metamask/onboarding';

import { croSkullRedPotionImageHack } from 'src/hacks';
import Button from './Button';
import MakeOfferDialog from '../Offer/MakeOfferDialog';
import { connectAccount, chainConnect } from 'src/GlobalState/User';

const Watermarked = styled.div`
  position: relative;
  &:after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
    background-image: url(${(props) => props.watermark});
    background-size: 60px 60px;
    background-position: 0px 0px;
    background-repeat: no-repeat;
    opacity: 0.3;
  }
`;

const MakeBuy = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MakeOffer = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;

  .w-45 {
    width: 45%;
  }
`;

const NftCard = ({ royalty, listing, imgClass = 'marketplace', watermark, address, collectionMetadata }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);

  const handleMakeOffer = () => {
    if (user.address) {
      setOpenMakeOfferDialog(!openMakeOfferDialog);
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

  const handleBuy = () => {
    // if (listing.market?.id) {
    //   history.push(`/listing/${listing.market?.id}`);
    // } else {
      history.push(`/collection/${listing.address}/${listing.id}`);
    // }
  };

  const getIsNftListed = () => {
    if (listing.market?.price) {
      return true;
    }
    return false;
  };

  return (
    <>
      <div className="card eb-nft__card h-100 shadow">
        <Link className="linkPointer" to={`/collection/${listing.address}/${listing.id}`}>
          {watermark ? (
            <Watermarked watermark={watermark}>
              <img
                src={croSkullRedPotionImageHack(listing.address, listing.image)}
                className={`card-img-top ${imgClass}`}
                alt={listing.name}
              />
            </Watermarked>
          ) : (
            <img
              src={croSkullRedPotionImageHack(listing.address, listing.image)}
              className={`card-img-top ${imgClass}`}
              alt={listing.name}
            />
          )}
        </Link>
        {listing.rank && <div className="badge bg-rarity text-wrap mt-1 mx-1">Rank: #{listing.rank}</div>}
        <div className="card-body d-flex flex-column justify-content-between">
          <Link className="linkPointer" to={`/collection/${listing.address}/${listing.id}`}>
            <h6 className="card-title mt-auto">{listing.name}</h6>
          </Link>
          {getIsNftListed() && (
            <MakeBuy>
              <div>{ethers.utils.commify(listing.market?.price)} CRO</div>
            </MakeBuy>
          )}
          <MakeOffer>
            {getIsNftListed() ? (
              <div>
                <Button type="legacy" onClick={handleBuy}>
                  Buy
                </Button>
              </div>
            ) : (
              <div></div>
            )}
            <div>
              <Button type="legacy-outlined" onClick={() => handleMakeOffer()}>
                Offer
              </Button>
            </div>
          </MakeOffer>
        </div>
      </div>
      {openMakeOfferDialog && (
        <MakeOfferDialog
          isOpen={openMakeOfferDialog}
          toggle={() => setOpenMakeOfferDialog(!openMakeOfferDialog)}
          nftData={listing}
          royalty={royalty}
          collectionMetadata={collectionMetadata}
        />
      )}
    </>
  );
};

export default memo(NftCard);