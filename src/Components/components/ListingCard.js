import React, { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import Link from 'next/link';
import { ethers } from 'ethers';
import MetaMaskOnboarding from '@metamask/onboarding';

import { croSkullRedPotionImageHack } from 'src/hacks';
import Button from './Button';
import MakeOfferDialog from '../Offer/MakeOfferDialog';
import { connectAccount, chainConnect } from 'src/GlobalState/User';
import { round } from '../../utils';

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

const ListingCard = ({ listing, imgClass = 'marketplace', watermark, address, collectionMetadata }) => {
  const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);

  const handleMakeOffer = (type) => {
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

  const convertListingData = (listingData) => {
    const res = {
      address: listingData.nftAddress,
      id: listingData.nftId,
      image: listingData.nft.image,
      name: listingData.nft.name,
      description: listingData.nft.description,
      rank: listingData.rank,
      royalty: listingData.royalty,
    };
    return res;
  };

  return (
    <>
      <div className="card eb-nft__card h-100 shadow">
        <Link className="linkPointer" to={`/collection/${listing.nftAddress}/${listing.nftId}`}>
          {watermark ? (
            <Watermarked watermark={watermark}>
              <img
                src={croSkullRedPotionImageHack(listing.nftAddress, listing.nft.image)}
                className={`card-img-top ${imgClass}`}
                alt={listing.nft.name}
              />
            </Watermarked>
          ) : (
            <img
              src={croSkullRedPotionImageHack(listing.nftAddress, listing.nft.image)}
              className={`card-img-top ${imgClass}`}
              alt={listing.nft.name}
            />
          )}
        </Link>
        {listing.nft.rank && <div className="badge bg-rarity text-wrap mt-1 mx-1">Rank: #{listing.nft.rank}</div>}
        <div className="card-body d-flex flex-column justify-content-between">
          <Link className="linkPointer" to={`/collection/${listing.nftAddress}/${listing.nftId}`}>
            <h6 className="card-title mt-auto">{listing.nft.name}</h6>
          </Link>
          <MakeBuy>
            <div>{ethers.utils.commify(round(listing.price))} CRO</div>
          </MakeBuy>
          <MakeOffer>
            <Link className="linkPointer" to={`/collection/${listing.nftAddress}/${listing.nftId}`}>
              <Button type="legacy">Buy</Button>
            </Link>
            <div>
              <Button type="legacy-outlined" onClick={() => handleMakeOffer('Make')}>
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
          nftData={convertListingData(listing)}
          collectionMetadata={collectionMetadata}
        />
      )}
    </>
  );
};

export default memo(ListingCard);
