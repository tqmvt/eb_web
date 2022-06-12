import React, { memo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { ethers } from 'ethers';
import MetaMaskOnboarding from '@metamask/onboarding';

import { croSkullRedPotionImageHack } from '../../hacks';
import Button from './Button';
import MakeOfferDialog from '../Offer/MakeOfferDialog';
import { connectAccount, chainConnect } from '../../GlobalState/User';
import { isNftBlacklisted, round, getSlugFromAddress } from '../../utils';
import { AnyMedia } from './AnyMedia';

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

const nftImageUrl = (listing) => {
  const imageUrl = new URL(croSkullRedPotionImageHack(listing.address, listing.image));
  if(listing.image.startsWith('data')) return nft.image;
  if(!imageUrl.searchParams){
    imageUrl.searchParams = new URLSearchParams();
  }
  imageUrl.searchParams.delete('tr');
  imageUrl.searchParams.set('tr', 'n-ik_ml_thumbnail');

  return imageUrl.toString();
}

const NftCard = ({ royalty, listing, imgClass = 'marketplace', watermark, address, collection }) => {
  const history = useRouter();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);

  const handleMakeOffer = () => {
    const isBlacklisted = isNftBlacklisted(listing.address, listing.id);
    if (isBlacklisted) return;

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
    // if (listing?.address && listing?.id) {
    //   history.push(`/collection/${getSlugFromAddress(listing.address)}/${listing.id}`);
    // }
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
        {watermark ? (
          <Watermarked watermark={watermark}>
            <AnyMedia
              image={nftImageUrl(listing)}
              className={`card-img-top ${imgClass}`}
              title={listing.name}
              url={`/collection/${collection.slug}/${listing.id}`}
            />
          </Watermarked>
        ) : (
          <AnyMedia
            image={nftImageUrl(listing)}
            className={`card-img-top ${imgClass}`}
            title={listing.name}
            url={`/collection/${collection.slug}/${listing.id}`}
          />
        )}
        {listing.rank && <div className="badge bg-rarity text-wrap mt-1 mx-1">Rank: #{listing.rank}</div>}
        <div className="card-body d-flex flex-column justify-content-between">
          <Link href={`/collection/${collection.slug}/${listing.id}`}>
            <a>
              <h6 className="card-title mt-auto">{listing.name}</h6>
            </a>
          </Link>
          {getIsNftListed() && (
            <MakeBuy>
              {collection.multiToken && <div>Floor:</div>}
              <div>{ethers.utils.commify(round(listing.market?.price))} CRO</div>
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
        />
      )}
    </>
  );
};

export default memo(NftCard);
