import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import styled from 'styled-components';
import { Contract, ethers } from 'ethers';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Spinner } from 'react-bootstrap';

import Button from 'src/Components/components/Button';
import Input from 'src/Components/components/common/Input';
import ProfilePreview from 'src/Components/components/ProfilePreview';
import { croSkullRedPotionImageHack } from 'src/hacks';
import { humanize, shortAddress } from 'src/utils';
import { OFFER_TYPE } from '../MadeOffersRow';
import CloseIcon from 'src/Assets/images/close-icon-blue.svg';
import { updateOfferSuccess, updateOfferFailed } from 'src/GlobalState/offerSlice';
import EmptyData from '../EmptyData';
import config from 'src/Assets/networks/rpc_config.json';
import Market from 'src/Contracts/Marketplace.json';
import { getFilteredOffers } from 'src/core/subgraph';

const DialogContainer = styled(Dialog)`
  .MuiDialogContent-root {
    width: 700px;
    padding: 15px 42px 28px !important;
    border-radius: 8px;
    max-width: 734px;

    @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
      width: 100%;
    }
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
    border-radius: 6px;
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
  margin-top: 8px;
`;

const Royalty = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textColor3};
`;

const Disclaimer = styled.div`
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

export default function MakeOfferDialog({ isOpen, toggle, type, nftData, offerData, collectionMetadata }) {
  const isNftLoading = useSelector((state) => {
    return state.nft.loading;
  });
  const offerContract = useSelector((state) => {
    return state.user.offerContract;
  });
  const walletAddress = useSelector((state) => state.user.address);

  const dispatch = useDispatch();
  const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
  const readMarket = new Contract(config.market_contract, Market.abi, readProvider);

  const [offerType, setOfferType] = useState(type);
  const [offerDataNew, setOfferDataNew] = useState(offerData);
  const [isGettingOfferType, setIsGettingOfferType] = useState(false);

  const [offerPrice, setOfferPrice] = useState(0);
  const [offerPriceError, setOfferPriceError] = useState(false);
  const onOfferValueChange = (inputEvent) => {
    const inputValue = inputEvent.target.value;
    setOfferPrice(inputValue);
    if (offerType === OFFER_TYPE.update && offerDataNew?.price && Number(inputValue) > Number(offerDataNew.price)) {
      setOfferPriceError(false);
    } else if (offerType === OFFER_TYPE.make && Number(inputValue) > 0) {
      setOfferPriceError(false);
    } else {
      setOfferPriceError(true);
    }
  };

  const [isOnAction, setIsOnAction] = useState(false);

  const [royalty, setRoyalty] = useState(null);
  useEffect(() => {
    async function asyncFunc() {
      let royalties = await readMarket.royalties(nftData.address);
      setRoyalty(Math.round(royalties[1]) / 100);
    }
    if (nftData) {
      asyncFunc();
    }
    // eslint-disable-next-line
  }, [nftData]);

  useEffect(() => {
    async function func() {
      setIsGettingOfferType(true);
      const filteredOffers = await getFilteredOffers(nftData.address, nftData.id, walletAddress);
      if (filteredOffers && filteredOffers.data.length > 0) {
        setOfferDataNew(filteredOffers.data[0]);
        setOfferType(OFFER_TYPE.update);
      } else {
        setOfferType(OFFER_TYPE.make);
      }
      setIsGettingOfferType(false);
    }
    if (!type && walletAddress && nftData.address && nftData.id) {
      func();
    }
  }, []);

  if (!nftData) {
    return <></>;
  }

  const handleOfferAction = async (actionType) => {
    try {
      let tx, receipt;
      setIsOnAction(true);
      if (actionType === OFFER_TYPE.make) {
        if (!offerPrice || offerPrice < 0) {
          setIsOnAction(false);
          setOfferPriceError(true);
          return;
        }
        tx = await offerContract.makeOffer(nftData.address, nftData.id, {
          value: ethers.utils.parseEther(offerPrice),
        });
        receipt = await tx.wait();
      } else if (actionType === OFFER_TYPE.update) {
        if (!offerPrice || offerPrice <= Number(offerDataNew.price)) {
          setIsOnAction(false);
          setOfferPriceError(true);
          return;
        }
        tx = await offerContract.makeOffer(nftData.address, nftData.id, {
          value: ethers.utils.parseEther((offerPrice - offerDataNew.price).toString()),
        });
        receipt = await tx.wait();
      } else if (actionType === OFFER_TYPE.cancel) {
        tx = await offerContract.cancelOffer(offerDataNew?.hash, offerDataNew?.offerIndex);
        receipt = await tx.wait();
      } else if (actionType === OFFER_TYPE.reject) {
        tx = await offerContract.rejectOffer(offerDataNew?.hash, offerDataNew?.offerIndex);
        receipt = await tx.wait();
      }
      dispatch(updateOfferSuccess(receipt.transactionHash, walletAddress));
    } catch (e) {
      dispatch(updateOfferFailed(e));
    }
    setIsOnAction(false);
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
        {!isGettingOfferType && <DialogTitleContainer>{offerType} Offer</DialogTitleContainer>}
        {!isNftLoading && !isGettingOfferType ? (
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
                          avatar={
                            collectionMetadata?.rarity === 'rarity_sniper' ? '/img/logos/rarity-sniper.png' : null
                          }
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
                <Royalty>{royalty ? `${royalty}%` : '-'}</Royalty>
              </FlexRow>
              {(offerType === OFFER_TYPE.make || offerType === OFFER_TYPE.update) && (
                <>
                  <FlexRow>
                    <OfferPrice>
                      {offerType === OFFER_TYPE.update ? (
                        <>New Offer Price</>
                      ) : (
                        <>Offer Price</>
                      )}
                    </OfferPrice>
                    <OfferPriceInput>
                      <Input
                        type="number"
                        className={`mx-2${offerPriceError ? ' is-error' : ''}`}
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
                  {offerType === OFFER_TYPE.update && offerDataNew && (
                    <FlexRow>
                      {offerPrice > parseInt(offerDataNew.price) && (
                        <Disclaimer>
                          Offer will be increased by {offerPrice > parseInt(offerDataNew.price) ? offerPrice - parseInt(offerDataNew.price) : 0} CRO
                        </Disclaimer>
                      )}
                    </FlexRow>
                  )}
                </>
              )}
              <div className="mt-3">
                <Button
                  type="legacy"
                  onClick={() => handleOfferAction(offerType)}
                  isLoading={isOnAction}
                  disabled={isOnAction}
                >
                  {offerType} Offer
                </Button>
              </div>
            </NftDetailContainer>
          </DialogMainContent>
        ) : (
          <EmptyData>
            <Spinner animation="border" role="status" size="sm" className="ms-1">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </EmptyData>
        )}
        <CloseIconContainer onClick={() => toggle(OFFER_TYPE.none)}>
          <img src={CloseIcon} alt="close" />
        </CloseIconContainer>
      </DialogContent>
    </DialogContainer>
  );
}
