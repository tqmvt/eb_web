import React, { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import { ethers } from 'ethers';
import MetaMaskOnboarding from '@metamask/onboarding';

import { specialImageTransform } from '../../hacks';
import Button from './Button';
import MakeOfferDialog from '../Offer/MakeOfferDialog';
import { getTheme } from '../../Theme/theme';
import { AnyMedia } from './AnyMedia';
import { connectAccount, chainConnect } from '../../GlobalState/User';
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

const ListingCard = ({ listing, imgClass = 'marketplace', watermark, address, collection }) => {
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

  const getCorrectPrice = (price) => {
    try {
      let newPrice = ethers.utils.commify(round(price));
      return newPrice;
    } catch (error) {
      return ethers.utils.commify(price);
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

  const nftImageUrl = (listing) => {
    const imageUrl = new URL(specialImageTransform(listing.nftAddress, listing.nft.image));
    if(listing.nft.image.startsWith('data')) return listing.nft.image;
    if(!imageUrl.searchParams){
      imageUrl.searchParams = new URLSearchParams();
    }
    imageUrl.searchParams.delete('tr');
    imageUrl.searchParams.set('tr', 'n-ml_card');
  
    return imageUrl.toString();
  }

  return (
    <>
      <div className="card eb-nft__card h-100 shadow">
        {watermark ? (
          <Watermarked watermark={watermark}>
            <AnyMedia
              image={nftImageUrl(listing)}
              className={`card-img-top ${imgClass}`}
              title={listing.nft.name}
              url={`/collection/${listing.nftAddress}/${listing.nftId}`}
            />
          </Watermarked>
        ) : (
          <AnyMedia
            image={nftImageUrl(listing)}
            className={`card-img-top ${imgClass}`}
            title={listing.nft.name}
            url={`/collection/${listing.nftAddress}/${listing.nftId}`}
          />
        )}
        {listing.nft.rank ? (
          <div className="badge bg-rarity text-wrap mt-1 mx-1">Rank: #{listing.nft.rank}</div>
        ) : (
          <div>&nbsp;</div>
        )}
        <div className="card-body d-flex flex-column justify-content-between">
          {collection && (
            <Link href={`/collection/${collection.slug}`}>
              <a>
                <h6
                  className="card-title mt-auto fw-normal"
                  style={{ fontSize: '12px', color: getTheme(user.theme).colors.textColor4 }}
                >
                  {collection.name}
                </h6>
              </a>
            </Link>
          )}
          <Link href={`/collection/${listing.nftAddress}/${listing.nftId}`}>
            <a>
              <h6 className="card-title mt-auto">{listing.nft.name}</h6>
            </a>
          </Link>
          <MakeBuy>
            <div>{getCorrectPrice(listing.price)} CRO</div>
          </MakeBuy>
          <MakeOffer>
            <Link href={`/collection/${listing.nftAddress}/${listing.nftId}`}>
              <a>
                <Button type="legacy">Buy</Button>
              </a>
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
        />
      )}
    </>
  );
};

export default memo(ListingCard);
