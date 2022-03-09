import React from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import styled from 'styled-components';

import Button from 'src/Components/components/Button';
import ProfilePreview from 'src/Components/components/ProfilePreview';
import { croSkullRedPotionImageHack } from 'src/hacks';
import { humanize } from 'src/utils';

const DialogContainer = styled(Dialog)`
  .MuiDialogContent-root {
    padding: 15px 42px 28px !important;
  }
`;

const DialogTitleContainer = styled(DialogTitle)`
  font-size: 32px !important;
  color: ${({ theme }) => theme.colors.textColor3};
  padding: 0px !important;
  margin-bottom: 24px !important;
  font-weight: bold;
  text-align: center;
`;

const DialogMainContent = styled.div`
  display: flex;
  justify-content: space-between;
`;

const ImageContainer = styled.div`
  width: 232px;
  height: 232px;

  img {
    width: 100%;
    height: 100%;
  }
`;

const NftDetailContainer = styled.div`
  width: 50%;
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
  font-size: 18px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.textColor3};
`;

export default function MakeOfferDialog({ isOpen, toggle, nftData, collectionMetadata }) {
  console.log(collectionMetadata);
  return (
    <DialogContainer onClose={toggle} open={isOpen}>
      <DialogContent>
        <DialogTitleContainer>Make offer</DialogTitleContainer>
        <DialogMainContent>
          <ImageContainer>
            <img src={croSkullRedPotionImageHack(nftData.nftAddress, nftData.nft.image)} alt={nftData.nft.name} />
          </ImageContainer>
          <NftDetailContainer>
            <NftTitle>{nftData.nft.name}</NftTitle>
            <NftDescription>{nftData.nft.description}</NftDescription>
            <FlexRow>
              <div className="row" style={{ gap: '2rem 0' }}>
                <ProfilePreview
                  type="Collection"
                  title={'View Collection'}
                  avatar={nftData?.avatar}
                  address={'address'}
                  verified={nftData?.verified}
                  to={`/collection/${'address'}`}
                />

                {typeof nftData.nft.rank !== 'undefined' && nftData.nft.rank !== null && (
                  <ProfilePreview
                    type="Rarity Rank"
                    title={nftData.nft.rank}
                    avatar={nftData?.rarity === 'rarity_sniper' ? '/img/rarity-sniper.png' : null}
                    hover={
                      nftData.rarity === 'rarity_sniper' ? `Ranking provided by ${humanize(nftData.rarity)}` : null
                    }
                  />
                )}
              </div>
            </FlexRow>
            <FlexRow>
              <Royalty>Royalty</Royalty>
              <Royalty>{nftData.royalty}</Royalty>
            </FlexRow>
            <FlexRow>
              <OfferPrice>Offer Price</OfferPrice>
              <OfferPriceInput>input field CRO</OfferPriceInput>
            </FlexRow>
            <div>
              <Button>Make Offer</Button>
            </div>
          </NftDetailContainer>
        </DialogMainContent>
      </DialogContent>
    </DialogContainer>
  );
}
