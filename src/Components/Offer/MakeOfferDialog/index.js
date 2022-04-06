import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import Button from 'src/Components/components/Button';
import Input from 'src/Components/components/common/Input';
import ProfilePreview from 'src/Components/components/ProfilePreview';
import { croSkullRedPotionImageHack } from 'src/hacks';
import { humanize, shortAddress } from 'src/utils';
import { OFFER_TYPE } from '../MadeOffersRow';
import CloseIcon from 'src/Assets/images/close-icon-orange-grad.svg';
import { updateOfferSuccess, updateOfferFailed } from 'src/GlobalState/offerSlice';

const DialogContainer = styled(Dialog)`
  .MuiDialogContent-root {
    padding: 15px 42px 28px !important;
    border-radius: 8px;
    max-width: 734px;
  }
`;

const DialogTitleContainer = styled(DialogTitle)`
  font-size: 32px !important;
  color: ${({ theme }) => theme.colors.textColor3};
  padding: 0px !important;
  margin-bottom: 24px !important;
  font-weight: bold !important;
  text-align: center;
`;

const DialogMainContent = styled.div`
  display: flex;
  justify-content: space-between;
  position: relative;

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-direction: column;
  }
`;

const ImageContainer = styled.div`
  width: 232px;
  height: auto;
  margin-top: 6px;
  text-align: center;

  img {
    width: 100%;
  }

  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin: auto;
    margin-bottom: 10px;
  }
`;

const NftDetailContainer = styled.div`
  width: 50%;
  @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
  }
`;

const NftTitle = styled.div`
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.textColor3};
`;

const NftDescription = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textColor3};
`;

const FlexRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 0px;
`;

const Royalty = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textColor3};
`;

const OfferPrice = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textColor3};
`;

const OfferPriceInput = styled.div`
  width: 60%;
  display: flex;
  align-items: center;
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.textColor3};
`;

const CloseIconContainer = styled.div`
  position: absolute;
  top: 14px;
  right: 14px;
  cursor: pointer;

  img {
    width: 28px;
  }
`;

export default function MakeOfferDialog({ isOpen, toggle, type = 'Make', nftData, offerData, collectionMetadata }) {
  const offerContract = useSelector((state) => {
    return state.user.offerContract;
  });

  const dispatch = useDispatch();

  const [offerPrice, setOfferPrice] = useState(0);
  const onOfferValueChange = (inputEvent) => {
    setOfferPrice(inputEvent.target.value);
  };

  if (!nftData) {
    return <></>;
  }

  const handleOfferAction = async (actionType) => {
    try {
      let tx, receipt;
      if (actionType === OFFER_TYPE.make) {
        if (!offerPrice || offerPrice < 0) {
          return;
        }
        tx = await offerContract.makeOffer(nftData.address, nftData.id, {
          value: ethers.utils.parseEther(offerPrice),
        });
        receipt = await tx.wait();
      } else if (actionType === OFFER_TYPE.update) {
        tx = await offerContract.makeOffer(nftData.address, nftData.id, {
          value: ethers.utils.parseEther(offerPrice),
        });
        receipt = await tx.wait();
      } else if (actionType === OFFER_TYPE.cancel) {
        tx = await offerContract.cancelOffer(offerData?.hash, offerData?.offerIndex);
        receipt = await tx.wait();
      }
      dispatch(updateOfferSuccess(receipt.transactionHash));
    } catch (e) {
      dispatch(updateOfferFailed(e));
    }
    toggle(OFFER_TYPE.none);
  };

  const fullImage = () => {
    if (nftData.image.startsWith('ipfs://')) {
      const link = nftData.image.split('://')[1];
      return `https://ipfs.io/ipfs/${link}`;
    }

    return nftData.image;
  };

  return (
    <DialogContainer onClose={() => toggle(OFFER_TYPE.none)} open={isOpen} maxWidth="md">
      <DialogContent>
        <DialogTitleContainer>{type} offer</DialogTitleContainer>
        <DialogMainContent>
          <ImageContainer>
            <img src={croSkullRedPotionImageHack(nftData.address, nftData.image)} alt={nftData.name} />
            {nftData && nftData.image && (
              <div className="nft__item_action mt-2" style={{ cursor: 'pointer' }}>
                <span onClick={() => window.open(croSkullRedPotionImageHack(nftData.address, fullImage()), '_blank')}>
                  <span className="p-2">View Full Image</span>
                  <FontAwesomeIcon icon={faExternalLinkAlt} />
                </span>
              </div>
            )}
          </ImageContainer>
          <NftDetailContainer>
            <NftTitle>{nftData.name}</NftTitle>
            <NftDescription>{nftData.description}</NftDescription>
            {collectionMetadata && (
              <FlexRow className="row">
                <div className="item_info">
                  <div className="row" style={{ gap: '2rem 0' }}>
                    <ProfilePreview
                      type="Collection"
                      title={nftData.address && shortAddress(nftData.address)}
                      avatar={collectionMetadata?.avatar}
                      address={nftData.address}
                      verified={collectionMetadata?.verified}
                      to={`/collection/${nftData.address}`}
                    />

                    {typeof nftData.rank !== 'undefined' && nftData.rank !== null && (
                      <ProfilePreview
                        type="Rarity Rank"
                        title={nftData.rank}
                        avatar={collectionMetadata?.rarity === 'rarity_sniper' ? '/img/rarity-sniper.png' : null}
                        hover={
                          collectionMetadata?.rarity === 'rarity_sniper'
                            ? `Ranking provided by ${humanize(collectionMetadata.rarity)}`
                            : null
                        }
                      />
                    )}
                  </div>
                </div>
              </FlexRow>
            )}
            <FlexRow>
              <Royalty>Royalty</Royalty>
              <Royalty>{nftData.royalty}</Royalty>
            </FlexRow>
            {type !== 'Cancel' && (
              <FlexRow>
                <OfferPrice>Offer Price</OfferPrice>
                <OfferPriceInput>
                  <Input
                    type="number"
                    className="mx-2"
                    onKeyDown={(e) => {
                      if (e.code === 'Period' || e.code === 'Minus') {
                        e.preventDefault();
                      }
                    }}
                    onChange={onOfferValueChange}
                  />
                  CRO
                </OfferPriceInput>
              </FlexRow>
            )}
            <div>
              <Button onClick={() => handleOfferAction(type)}>{type} Offer</Button>
            </div>
          </NftDetailContainer>
        </DialogMainContent>
        <CloseIconContainer onClick={() => toggle(OFFER_TYPE.none)}>
          <img src={CloseIcon} alt="close" />
        </CloseIconContainer>
      </DialogContent>
    </DialogContainer>
  );
}
