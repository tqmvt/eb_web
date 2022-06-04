import React, { memo } from 'react';
// import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import Clock from './Clock';
import { auctionState } from '../../core/api/enums';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faGavel, faGem} from "@fortawesome/free-solid-svg-icons";

// const Outer = styled.div`
//   display: flex;
//   justify-content: center;
//   align-content: center;
//   align-items: center;
//   overflow: hidden;
//   border-radius: 8px;
// `;

const AuctionCard = ({ listing, imgClass = 'marketplace' }) => {
  const isLegendary = parseInt(listing.nftId) > 10000;
  const borderColor = isLegendary ? '2px solid #FFD700' : '1px solid #ddd';
  const boxShadowColor = isLegendary ? '0 0 .5rem #FFD700' : '0 .5rem 1rem #000';

  return (
    <Link className="linkPointer" to={`/auctions/${listing.getAuctionId}`}>
      <div className="card eb-nft__card h-100" style={{border:borderColor, boxShadow:boxShadowColor}}>
        <img src={listing.nft.image} className={`card-img-top ${imgClass}`} alt={listing.nft.name} />
        <div className="eb-de_countdown text-center">
          {listing.state === auctionState.ACTIVE && <>Ends In:</>}
          {listing.state === auctionState.NOT_STARTED && <div className="fw-bold">Not Started</div>}
          {listing.state === auctionState.ACTIVE && <Clock deadline={listing.getEndAt} />}
          {listing.state === auctionState.CANCELLED && <div className="fw-bold">Cancelled</div>}
          {listing.state === auctionState.SOLD && <div className="fw-bold"><FontAwesomeIcon icon={faGavel} /> Sold</div>}
        </div>
        <div className="card-body d-flex flex-column">
          <h6 className="card-title mt-auto">{listing.nft.name}{isLegendary && <span title="Legendary!">&#128142;</span>}</h6>
          <p className="card-text">{ethers.utils.commify(listing.getHighestBid)} MAD</p>
        </div>
      </div>
    </Link>
  );
};

export default memo(AuctionCard);
