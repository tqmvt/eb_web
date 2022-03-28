import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import { croSkullRedPotionImageHack } from '../../hacks';
import Button from './Button';
import MakeOfferDialog from '../Offer/MakeOfferDialog';
import AcceptOfferDialog from '../Offer/AcceptOfferDialog';

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

const ListingCardCollection = ({ listing, imgClass = 'marketplace', watermark, address, collectionMetadata }) => {
  const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);
  const [openAcceptDialog, setOpenAcceptDialog] = useState(false);
  const [modalType, setModalType] = useState('Make');
  const handleMakeOffer = (type) => {
    setModalType(type);
    setOpenMakeOfferDialog(!openMakeOfferDialog);
  };

  const handleAcceptOffer = () => {
    setOpenAcceptDialog(!openAcceptDialog);
  };

  const history = useHistory();
  const handleBuy = () => {
    history.push(`/listing/${listing.listingId}`);
  };

  const getIsNftListed = () => {
    if (listing.market?.price) {
      return true;
    }
    return false;
  };

  return (
    <>
      {/* <Link className="linkPointer" to={`/listing/${listing.listingId}`}> */}
      <div className="card eb-nft__card h-100 shadow">
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
        {listing.rank && <div className="badge bg-rarity text-wrap mt-1 mx-1">Rank: #{listing.rank}</div>}
        <div className="card-body d-flex flex-column">
          <h6 className="card-title mt-auto">{listing.name}</h6>
          {getIsNftListed() && (
            <MakeBuy>
              <div>{ethers.utils.commify(listing.market?.price)} CRO</div>
            </MakeBuy>
          )}
          <MakeOffer>
            {getIsNftListed() && (
              <div className="w-45">
                <Button onClick={handleBuy}>Buy</Button>
              </div>
            )}
            {!getIsNftListed() && (
              <div className="w-45">
                <Button type="outlined" onClick={() => handleMakeOffer('Make')}>
                  Offer
                </Button>
              </div>
            )}
          </MakeOffer>
        </div>
      </div>
      {/* </Link> */}
      <MakeOfferDialog
        isOpen={openMakeOfferDialog}
        toggle={() => setOpenMakeOfferDialog(!openMakeOfferDialog)}
        nftData={listing}
        address={address}
        collectionMetadata={collectionMetadata}
        type={modalType}
      />
      <AcceptOfferDialog
        isOpen={openAcceptDialog}
        toggle={() => setOpenAcceptDialog(!openAcceptDialog)}
        nftData={listing}
        address={address}
        collectionMetadata={collectionMetadata}
      />
    </>
  );
};

export default memo(ListingCardCollection);
