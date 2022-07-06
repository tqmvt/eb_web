import React, { memo, useEffect, useState, useCallback } from 'react';

import { Form, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faDollarSign, faCheck, faAngleDown } from '@fortawesome/free-solid-svg-icons';

import { connect, useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import moment from 'moment';

import { MyNftPageActions } from '../../GlobalState/User';
import { getCollectionMetadata } from '../../core/api';
import useOutSide from '../../hooks/useOutSide';
import NftContainer from './NftContainer';
import DialogAlert from './DialogAlert'
import DotIcon from './DotIcon'

import Constants from '../../constants'
import useFeatureFlag from '../../hooks/useFeatureFlag';

const numberRegexValidation = /^[1-9]+[0-9]*$/;

const timeOptions = [
  {
    label: '1 day',
    value: '1'
  },
  {
    label: '3 days',
    value: '3'
  },
  {
    label: '7 days',
    value: '7'
  },

]

const DialogAlertTypes = {
  approveTransferDialog: 'approveTransferDialog',
  enableListingDialog: 'enableListingDialog',
  successDialog: 'successDialog',
  floorPriceWarningDialog: 'floorPriceWarningDialog'
}

const mapStateToProps = (state) => ({
  walletAddress: state.user.address,
  marketContract: state.user.marketContract,
  myNftPageListDialog: state.user.myNftPageListDialog,
});

const MyNFTSaleForm = ({ walletAddress, marketContract, myNftPageListDialog }) => {
  const dispatch = useDispatch();
  const router = useRouter();
  const { collectionId, nftId } = router.query;

  const { visible: finalStep, setVisible: setFinalStep, ref } = useOutSide(false);
  const [salePrice, setSalePrice] = useState(0);
  const [isTransferEnable, setIsTransferEnable] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nftName,] = useState(myNftPageListDialog?.name);
  const user = useSelector((state) => state.user);

  const [popupTrigger, setPopupTrigger] = useState({
    isActive: false,
    currentType: ''
  })

  const [fee, setFee] = useState(0);
  const [royalty, setRoyalty] = useState(0);
  const [floorPrice, setFloorPrice] = useState(0);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const [saleType, setSaleType] = useState(1);
  const [buyNow, setBuyNow] = useState(false);

  const { Features } = Constants;
  const isAuctionOptionEnabled = useFeatureFlag(Features.AUCTION_OPTION_SALE)

  const changeBuyNow = () => {
    setBuyNow(!buyNow);
  }

  const changeSaleType = (type) => {
    switch (type) {
      case 'auction':
        setSaleType(0);
        break;
      case 'fixedPrice':
        setSaleType(1);
        break;
      default:
        setSaleType(1);
    }
  }

  const isBelowFloorPrice = (floorPrice !== 0 && ((floorPrice - Number(salePrice)) / floorPrice) * 100 > 5);

  const costOnChange = useCallback((e) => {
    const newSalePrice = e.target.value.toString();
    if (numberRegexValidation.test(newSalePrice) || newSalePrice === '') {
      setSalePrice(newSalePrice)
    }
  }, [setSalePrice, floorPrice, salePrice]);

  useEffect(() => {
    if (!myNftPageListDialog) router.push(`/nfts`);
  }, [])

  useEffect(() => {
    async function asyncFunc() {
      if (myNftPageListDialog) {
        await getInitialProps();
      }
    }
    asyncFunc();
  }, [myNftPageListDialog]);

  const getInitialProps = async () => {
    try {
      const marketContractAddress = marketContract.address;

      const { contract, address } = myNftPageListDialog;

      const floorPrice = await getCollectionMetadata(contract.address, null, {
        type: 'collection',
        value: contract.address,
      });
      if (floorPrice.collections.length > 0) {
        setFloorPrice(floorPrice.collections[0].floorPrice ?? 0);
      }

      const fees = await marketContract.fee(walletAddress);
      const royalties = await marketContract.royalties(address);

      setSalePrice(myNftPageListDialog.price ? parseInt(myNftPageListDialog.price).toString() : 0);

      setFee((fees / 10000) * 100);
      setRoyalty((royalties[1] / 10000) * 100);
      const transferEnabled = await contract.isApprovedForAll(walletAddress, marketContractAddress);

      if (transferEnabled) {
        setIsTransferEnable(true);
      } else {
        setIsTransferEnable(false);
      }
      setIsLoading(false);
    } catch (error) {
      if (error.data) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Unknown Error');
      }
    }
  };

  const listDialogSetApprovalForAllStep = async (e) => {
    e.preventDefault();
    try {
      const marketContractAddress = marketContract.address;
      const { contract } = myNftPageListDialog;
      setWaitingConfirmation(true);
      const tx = await contract.setApprovalForAll(marketContractAddress, true);
      await tx.wait();
      setIsTransferEnable(true);
      setWaitingConfirmation(false);

    } catch (error) {
      if (error.data) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Unknown Error');
      }
      setWaitingConfirmation(false);
    }
  };

  const listDialogConfirmListingStep = async (e) => {
    e.preventDefault()

    const { contract } = myNftPageListDialog;

    const nftId = myNftPageListDialog.id;

    setWaitingConfirmation(true);

    dispatch(
      MyNftPageActions.listingDialogConfirm({
        contractAddress: contract.address,
        nftId,
        salePrice,
        marketContract,
      })
    );

  };

  useEffect(() => {
    if (user.myNftPageListDialogError) {
      setWaitingConfirmation(false);
    }
  }, [user.myNftPageListDialogError])

  const getYouReceiveViewValue = () => {
    const youReceive = salePrice - (fee / 100) * salePrice - (royalty / 100) * salePrice;
    return ethers.utils.commify(youReceive.toFixed(2));
  };

  const openPopup = useCallback((e) => {
    e.preventDefault();
    if (salePrice <= 0) {
      setPriceError(true);
    }
    else {
      if (isTransferEnable) {
        setFinalStep(true);
      }
      setPriceError(false);
    }
  }, [setFinalStep, salePrice, isTransferEnable])

  const closePopup = useCallback((e) => {
    e.preventDefault();
    setFinalStep(false);
  }, [setFinalStep])

  const getDialogAlertData = {

    approveTransferDialog: {
      title: 'Approve Transfer',
      firstButtonText: 'Continue',
      isWaiting: true,
      onClickFirstButton: listDialogSetApprovalForAllStep,
      closePopup: () => router.push(`/nfts`),
      text: 'Ebisu\'s Bay needs approval to transfer your NFT on your behalf',
    },
    enableListingDialog: {
      title: 'Enable Listing',
      firstButtonText: 'Continue',
      onClickFirstButton: listDialogConfirmListingStep,
      closePopup: closePopup,
      isWaiting: true,
      text: 'Before you can list your NFT, you must confirm the transaction in your wallet',
      warningMessage: `The desired price is ${(100 - (salePrice * 100 / floorPrice)).toFixed(1)}% below the current floor price of ${floorPrice} CRO`,
    },
    successDialog: {
      title: 'Success!',
      firstButtonText: 'Back to My NFTs',
      secondButtonText: 'View NFT',
      onClickFirstButton: () => router.push(`/nfts`),
      onClickSecondButton: () => router.push(`/collection/${collectionId}/${nftId}`),
      text: `The sale for ${nftName} on ${moment(new Date()).format('MM/DD/YYYY')} has been submitted for listing`,
    },
    floorPriceWarningDialog: {
      title: 'Warning',
      firstButtonText: 'Change price',
      onClickSecondButton: (e) => {
        e.preventDefault();
        setPopupTrigger({
          isActive: true,
          currentType: DialogAlertTypes.enableListingDialog
        })
      },
      secondButtonText: 'Accept',
      onClickFirstButton: closePopup,
      text: `The desired price is ${(100 - (salePrice * 100 / floorPrice)).toFixed(1)}% below the current floor price of ${floorPrice} CRO`,
      closePopup: closePopup,
      isWarningMessage: true,
    }
  }

  const activePopup = useCallback(() => {
    if (!isTransferEnable) {
      setPopupTrigger({
        isActive: true,
        currentType: DialogAlertTypes.approveTransferDialog
      })
      return
    }
    if (!myNftPageListDialog && !isLoading) {
      setPopupTrigger({
        isActive: true,
        currentType: DialogAlertTypes.successDialog
      })
      return
    }
    if (finalStep) {
      if (isBelowFloorPrice && !waitingConfirmation) {
        setPopupTrigger({
          isActive: true,
          currentType: DialogAlertTypes.floorPriceWarningDialog
        })
        return
      }
      else {
        setPopupTrigger({
          isActive: true,
          currentType: DialogAlertTypes.enableListingDialog
        })
        return
      }
    }
    else {
      setPopupTrigger({
        isActive: false,
        currentType: DialogAlertTypes.enableListingDialog
      })
      return
    }
  }, [isLoading, isTransferEnable, myNftPageListDialog, finalStep])

  useEffect(() => {
    if (!isLoading) activePopup();
  }, [isLoading, isTransferEnable, myNftPageListDialog, finalStep])

  return (
    <div className='nftSaleForm'>
      {isLoading &&
        (<span className="d-flex align-items-center spinner-span">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </span>)}

      {myNftPageListDialog && !isLoading && <>
        <h2 className='title'>{`${myNftPageListDialog?.name} Listing Details`}</h2>
        <div className='formContainer'>
          <form className='saleForm'>
            <div className='left-column'>

              <h3>Sale Type</h3>

              <div className='buttonGroup'>
                {isAuctionOptionEnabled && <div className={`card form_icon_button shadow first-button ${saleType === 0 ? 'active' : ''}`} onClick={() => changeSaleType('auction')}>
                  {saleType === 0 && <DotIcon icon={faCheck} />}
                  <FontAwesomeIcon className='icon' icon={faClock} />
                  <p>Auction</p>
                </div>}

                <div className={`card form_icon_button shadow ${saleType === 1 ? 'active' : ''}`} onClick={() => changeSaleType('fixedPrice')}>
                  {saleType === 1 && <DotIcon icon={faCheck} />}
                  <FontAwesomeIcon className='icon' icon={faDollarSign} />
                  <p>Fixed Price</p>
                </div>
              </div>

              <Form.Group className='form-field mb-3'>
                <div className='label-container'>
                  <Form.Label className='formLabel'>{saleType === 1 ? 'Listing Price' : 'Starting Bid Price'}</Form.Label>
                </div>
                <Form.Control className='input' type='text' placeholder='Enter Amount' value={salePrice} onChange={costOnChange} />
                <Form.Text className='field-description textError'>
                  {priceError && 'The entered value must be greater than zero'}
                </Form.Text>
              </Form.Group>

              {saleType === 0 && isAuctionOptionEnabled &&
                <>
                  <Form.Group className='form-field mb-3 check-group'>
                    <Form.Label className='formLabel' >Enable Buy it Now Price?</Form.Label>
                    <span className='check-container'>
                      <Form.Check type='switch' className='check-form' onChange={changeBuyNow} checked={buyNow} />
                      <Form.Label className='formLabel'>{!buyNow ? 'No' : 'Yes'}</Form.Label>
                    </span>
                  </Form.Group>

                  {buyNow &&
                    <Form.Group className='form-field mb-3'>
                      <div className='label-container'>
                        <Form.Label className='formLabel'>Buy it Now Price</Form.Label>
                      </div>
                      <Form.Control className='input' type='number' placeholder='Enter Text' />
                    </Form.Group>
                  }

                  <Form.Group className='form-field mb-3'>
                    <div className='label-container'>
                      <Form.Label className='formLabel'>Auction Run Time</Form.Label>
                    </div>
                    <div className='select-container'>
                      <FontAwesomeIcon className='icon select-icon' icon={faAngleDown} />
                      <Form.Select className='select-form'>
                        {timeOptions.map((option, i) =>
                          <option key={i} value={option.value}>{option.label}</option>
                        )}
                      </Form.Select>
                    </div>
                    <Form.Text className='field-description textError'>
                      {priceError && 'The entered value must be greater than zero'}
                    </Form.Text>
                  </Form.Group>
                </>
              }
              <div className='buttonGroup'>
                <button
                  className='btn-main'
                  onClick={isTransferEnable && myNftPageListDialog ? openPopup : (e) => { e.preventDefault() }}
                >
                  List Now
                </button>
              </div>

              <div>
                <h3 className='feeTitle'>Fees</h3>
                <hr />
                <div className='fee'>
                  <span>Service Fee: </span>
                  <span>{fee} %</span>
                </div>
                <div className='fee'>
                  <span>Royalty Fee: </span>
                  <span>{royalty} %</span>
                </div>
                <div className='fee'>
                  <span className='label'>Buyer pays: </span>
                  <span>{salePrice} CRO</span>
                </div>
                <div className='fee'>
                  <span className='label'>You receive: </span>
                  <span>{getYouReceiveViewValue()} CRO</span>
                </div>
              </div>
            </div>

          </form>
          <div>
            <h3 className='cardTitle'>Live Preview</h3>
            <NftContainer nft={myNftPageListDialog} price={salePrice} isPreview={true} />
          </div>
        </div>
      </>}
      {(popupTrigger.isActive) && (
        <span ref={waitingConfirmation? null : ref}>
          {
            <DialogAlert
              title={getDialogAlertData[popupTrigger.currentType].title}
              firstButtonText={getDialogAlertData[popupTrigger.currentType].firstButtonText}
              onClickFirstButton={getDialogAlertData[popupTrigger.currentType].onClickFirstButton}
              secondButtonText={getDialogAlertData[popupTrigger.currentType].secondButtonText}
              onClickSecondButton={getDialogAlertData[popupTrigger.currentType].onClickSecondButton}
              closePopup={getDialogAlertData[popupTrigger.currentType].closePopup}
              isWaiting={getDialogAlertData[popupTrigger.currentType].isWaiting ? waitingConfirmation : null}
              isWarningMessage={getDialogAlertData[popupTrigger.currentType].isWarningMessage ? true : false}
            >
              <span>{getDialogAlertData[popupTrigger.currentType].text}</span>
              {isBelowFloorPrice && getDialogAlertData[popupTrigger.currentType].warningMessage &&
                <span className='warningMessage'>
                  {getDialogAlertData[popupTrigger.currentType].warningMessage}
                </span>
              }
            </DialogAlert>
          }
        </span>
      )}
    </div>
  )
}

export default connect(mapStateToProps)(memo(MyNFTSaleForm));