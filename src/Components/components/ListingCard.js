import React, { memo } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import { croSkullRedPotionImageHack } from '../../hacks';
import Button from './Button';

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

const MakeOffer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  .w-30 {
    width: 30%;
  }
`;

const ListingCard = ({ listing, imgClass = 'marketplace', watermark }) => {
  return (
    <Link className="linkPointer" to={`/listing/${listing.listingId}`}>
      <div className="card eb-nft__card h-100 shadow">
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
        {listing.nft.rank && <div className="badge bg-rarity text-wrap mt-1 mx-1">Rank: #{listing.nft.rank}</div>}
        <div className="card-body d-flex flex-column">
          <h6 className="card-title mt-auto">{listing.nft.name}</h6>
          <MakeOffer>
            <div>{ethers.utils.commify(listing.price)} CRO</div>
            <div className="w-30">
              <Button>Buy</Button>
            </div>
          </MakeOffer>
        </div>
      </div>
    </Link>
  );
};

export default memo(ListingCard);
