import React, { memo, useState } from 'react';
import styled from 'styled-components';
import { Link, useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import { croSkullRedPotionImageHack } from '../../hacks';
import Button from './Button';
import MakeOfferDialog from '../Offer/MakeOfferDialog';

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

// const Likes = styled.div`
//   font-size: 14px;
//   color: ${({ theme }) => theme.colors.textColor3};
// `;

const ListingCard = ({ listing, imgClass = 'marketplace', watermark, address, collectionMetadata }) => {
  const [openMakeOfferDialog, setOpenMakeOfferDialog] = useState(false);
  const [modalType, setModalType] = useState('Make');
  const handleMakeOffer = (type) => {
    setModalType(type);
    setOpenMakeOfferDialog(!openMakeOfferDialog);
  };

  const history = useHistory();
  const handleBuy = () => {
    history.push(`/listing/${listing.listingId}`);
  };

  return (
    <>
      {/* <Link className="linkPointer" to={`/listing/${listing.listingId}`}> */}
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
          <MakeBuy>
            <div>{ethers.utils.commify(listing.price)} CRO</div>
          </MakeBuy>
          <MakeOffer>
            <div className="w-45">
              <Button onClick={handleBuy}>Buy</Button>
            </div>
            <div className="w-45">
              <Button type="outlined" onClick={() => handleMakeOffer('Make')}>
                Offer
              </Button>
            </div>
            <div className="w-45">
              <Button type="outlined" onClick={() => handleMakeOffer('Update')}>
                Update
              </Button>
            </div>
            <div className="w-45">
              <Button type="outlined" onClick={() => handleMakeOffer('Cancel')}>
                Cancel
              </Button>
            </div>
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
    </>
  );
};

export default memo(ListingCard);
