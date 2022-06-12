import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import styled from 'styled-components';
import { Contract, ethers } from 'ethers';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Spinner } from 'react-bootstrap';

import Button from '../../../Components/components/Button';
import Input from '../../../Components/components/common/Input';
import ProfilePreview from '../../../Components/components/ProfilePreview';
import { specialImageTransform } from '../../../hacks';
import { caseInsensitiveCompare, humanize, isEventValidNumber, shortAddress } from '../../../utils';
import { OFFER_TYPE } from '../MadeOffersRow';
import { updateOfferSuccess, updateOfferFailed } from '../../../GlobalState/offerSlice';
import EmptyData from '../EmptyData';
import config from '../../../Assets/networks/rpc_config.json';
import Market from '../../../Contracts/Marketplace.json';
import { getFilteredOffers } from '../../../core/subgraph';
import { getAllCollections } from '../../../GlobalState/collectionsSlice';
import { offerState } from '../../../core/api/enums';
import { commify } from 'ethers/lib/utils';
import { txExtras } from '../../../core/constants';
import { findCollectionByAddress } from '../../../utils';
const knownContracts = config.known_contracts;

const DialogContainer = styled(Dialog)`
  .MuiPaper-root {
    border-radius: 8px;
    overflow: hidden;
    background-color: ${({ theme }) => theme.colors.bgColor1};
  }

  .MuiDialogContent-root {
    width: 700px;
    padding: 15px 42px 28px !important;
    border-radius: 8px;
    max-width: 734px;
    background-color: ${({ theme }) => theme.colors.bgColor1};
    color: ${({ theme }) => theme.colors.textColor3};

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

const FloorPrice = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textColor3};
`;

const Disclaimer = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textColor3};
`;

const PriceErrorDescription = styled.div`
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

export default function MakeOfferDialog({ isOpen, toggle, type, nftData, offerData }) {
  const isNftLoading = useSelector((state) => {
    return state.nft.loading;
  });
  const offerContract = useSelector((state) => {
    return state.user.offerContract;
  });
  const walletAddress = useSelector((state) => state.user.address);
  const collectionsStats = useSelector((state) => state.collections.collections);

  const dispatch = useDispatch();
  const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
  const readMarket = new Contract(config.market_contract, Market.abi, readProvider);

  const [offerType, setOfferType] = useState(type);
  const [offerDataNew, setOfferDataNew] = useState(offerData);
  const [isGettingOfferType, setIsGettingOfferType] = useState(false);

  const [offerPrice, setOfferPrice] = useState(0);
  const [offerPriceError, setOfferPriceError] = useState(false);
  const [offerPriceErrorDescription, setOfferPriceErrorDescription] = useState(null);
  const onOfferValueChange = (inputEvent) => {
    const inputValue = Math.floor(inputEvent.target.value);
    setOfferPrice(inputValue);
    const isAboveOfferThreshold = floorPrice ? parseInt(inputValue) >= floorPrice / 2 : true;

    if (!isAboveOfferThreshold) {
      setError(true);
    } else if (
      offerType === OFFER_TYPE.update &&
      offerDataNew?.price &&
      Number(inputValue) > Number(offerDataNew?.price)
    ) {
      setError(false);
    } else if (offerType === OFFER_TYPE.make && Number(inputValue) > 0) {
      setError(false);
    } else {
      setError(true);
    }
  };

  const setError = (isError, description = null) => {
    setOfferPriceError(isError);
    if (isError) setOfferPriceErrorDescription(description);
    else setOfferPriceErrorDescription(null);
  };

  const [isOnAction, setIsOnAction] = useState(false);
  const [floorPrice, setFloorPrice] = useState(null);

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
    async function asyncFunc() {
      const knownContract = findCollectionByAddress(nftData.address, nftData.id);
      const floorPrice = findCollectionFloor(knownContract);
      setFloorPrice(floorPrice);
    }

    if (collectionsStats && collectionsStats.length > 0) {
      if (nftData) {
        asyncFunc();
      }
    } else {
      dispatch(getAllCollections());
    }
    // eslint-disable-next-line
  }, [nftData, collectionsStats]);

  useEffect(() => {
    async function func() {
      setIsGettingOfferType(true);
      const filteredOffers = await getFilteredOffers(nftData.address, nftData.id, walletAddress);
      const data = filteredOffers
        ? filteredOffers.data.filter((o) => o.state.toString() === offerState.ACTIVE.toString())
        : [];
      if (data && data.length > 0) {
        setOfferDataNew(data);
        setOfferType(OFFER_TYPE.update);
      } else {
        setOfferType(OFFER_TYPE.make);
      }
      setIsGettingOfferType(false);
    }
    if (!type && walletAddress && nftData.address && nftData.id) {
      func();
    }
    // eslint-disable-next-line
  }, []);

  if (!nftData) {
    return <></>;
  }

  const collectionMetadata = findCollectionByAddress(nftData.address)?.metadata;

  const getUpdatedOffer = (offerDataNew1, actionType1, offerPrice1) => {
    if (actionType1 === OFFER_TYPE.update) {
      return { ...offerDataNew1, price: offerPrice1.toString() };
    } else if (actionType1 === OFFER_TYPE.accept) {
      return { ...offerDataNew1, state: '1' };
    } else if (actionType1 === OFFER_TYPE.reject) {
      return { ...offerDataNew1, state: '2' };
    } else if (actionType1 === OFFER_TYPE.cancel) {
      return { ...offerDataNew1, state: '3' };
    }
  };

  const handleOfferAction = async (actionType) => {
    try {
      let tx, receipt;
      setIsOnAction(true);
      const isAboveOfferThreshold = floorPrice ? parseInt(offerPrice) >= floorPrice / 2 : true;
      if (actionType === OFFER_TYPE.make) {
        if (!offerPrice || offerPrice < 0 || !isAboveOfferThreshold) {
          setIsOnAction(false);
          setError(true, 'Offer must be at least 50% of floor value');
          return;
        }
        tx = await offerContract.makeOffer(nftData.address, nftData.id, {
          ...{
            value: ethers.utils.parseEther(offerPrice.toString()),
          },
          ...txExtras,
        });

        receipt = await tx.wait();
      } else if (actionType === OFFER_TYPE.update) {
        if (!offerPrice || offerPrice <= Number(offerDataNew.price) || !isAboveOfferThreshold) {
          setIsOnAction(false);
          setError(true, 'Offer price must be greater than your previous offer');
          return;
        }
        tx = await offerContract.makeOffer(nftData.address, nftData.id, {
          ...{
            value: ethers.utils.parseEther((offerPrice - offerDataNew.price).toString()),
          },
          ...txExtras,
        });
        receipt = await tx.wait();
      } else if (actionType === OFFER_TYPE.cancel) {
        tx = await offerContract.cancelOffer(offerDataNew?.hash, offerDataNew?.offerIndex, txExtras);
        receipt = await tx.wait();
      } else if (actionType === OFFER_TYPE.reject) {
        tx = await offerContract.rejectOffer(offerDataNew?.hash, offerDataNew?.offerIndex, txExtras);
        receipt = await tx.wait();
      }

      dispatch(updateOfferSuccess(receipt.transactionHash, getUpdatedOffer(offerDataNew, actionType, offerPrice)));
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

  const findCollectionFloor = (knownContract) => {
    const collectionStats = collectionsStats.find((o) => {
      if (knownContract.multiToken && o.collection.indexOf('-') !== -1) {
        let parts = o.collection.split('-');
        return caseInsensitiveCompare(knownContract.address, parts[0]) && knownContract.id === parseInt(parts[1]);
      } else {
        return caseInsensitiveCompare(knownContract.address, o.collection);
      }
    });
    return collectionStats ? collectionStats.floorPrice : null;
  };

  return (
    <DialogContainer onClose={() => toggle(OFFER_TYPE.none)} open={isOpen} maxWidth="md">
      <DialogContent>
        {!isGettingOfferType && <DialogTitleContainer>{offerType} Offer</DialogTitleContainer>}
        {findCollectionByAddress(nftData.address, nftData.id)?.multiToken && (
          <div className="mb-5">
            If you are trying to make multiple offers on the same ERC1155 token, this is not possible currently. It will
            instead update your current offer for this token.
          </div>
        )}
        {!isNftLoading && !isGettingOfferType ? (
          <DialogMainContent>
            <ImageContainer>
              <img src={specialImageTransform(nftData.address, nftData.image)} alt={nftData.name} />
              {nftData && nftData.image && (
                <div className="nft__item_action mt-2" style={{ cursor: 'pointer' }}>
                  <span onClick={() => window.open(specialImageTransform(nftData.address, fullImage()), '_blank')}>
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
              <FlexRow>
                <FloorPrice>Floor Price</FloorPrice>
                <FloorPrice>{floorPrice ? `${ethers.utils.commify(floorPrice)} CRO` : '-'}</FloorPrice>
              </FlexRow>
              {(offerType === OFFER_TYPE.make || offerType === OFFER_TYPE.update) && (
                <>
                  <FlexRow>
                    <OfferPrice>{offerType === OFFER_TYPE.update ? <>New Offer Price</> : <>Offer Price</>}</OfferPrice>
                    <OfferPriceInput>
                      <Input
                        type="number"
                        className={`mx-2${offerPriceError ? ' is-error' : ''}`}
                        onKeyDown={(e) => {
                          if (!isEventValidNumber(e)) {
                            e.preventDefault();
                          }
                        }}
                        value={offerPrice}
                        onChange={onOfferValueChange}
                      />
                      CRO
                    </OfferPriceInput>
                  </FlexRow>
                  {offerType === OFFER_TYPE.update && offerDataNew && (
                    <FlexRow>
                      {offerPrice > parseInt(offerDataNew.price) && (
                        <Disclaimer>
                          Offer will be increased by{' '}
                          {offerPrice > parseInt(offerDataNew.price) ? offerPrice - parseInt(offerDataNew.price) : 0}{' '}
                          CRO
                        </Disclaimer>
                      )}
                    </FlexRow>
                  )}
                  {offerPriceErrorDescription && (
                    <FlexRow>
                      <PriceErrorDescription>{offerPriceErrorDescription}</PriceErrorDescription>
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
          <img src="/img/icons/close-icon-blue.svg" alt="close" width="40" height="40" />
        </CloseIconContainer>
      </DialogContent>
    </DialogContainer>
  );
}
