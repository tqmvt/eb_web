import React, { memo, useEffect, useState, useCallback } from 'react';

import { Form, Spinner } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faClock, faDollarSign, faCheck, faAngleDown } from '@fortawesome/free-solid-svg-icons';
import { connect, useDispatch } from 'react-redux';
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
    label: '5 days',
    value: '5'
  },
  {
    label: '15 days',
    value: '15'
  }
]

const mapStateToProps = (state) => ({
  walletAddress: state.user.address,
  marketContract: state.user.marketContract,
  myNftPageListDialog: state.user.myNftPageListDialog,
});

const MyNFTSaleForm = ({ walletAddress, marketContract, myNftPageListDialog }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const { visible: finalStep, setVisible: setFinalStep, ref } = useOutSide(false);
  const [salePrice, setSalePrice] = useState(0);
  const [isTransferEnable, setIsTransferEnable] = useState(false);
  const [priceError, setPriceError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [nftName,] = useState(myNftPageListDialog?.name);

  const [fee, setFee] = useState(0);
  const [royalty, setRoyalty] = useState(0);
  const [floorPrice, setFloorPrice] = useState(0);
  const [waitingConfirmation, setWaitingConfirmation] = useState(false);
  const [saleType, setSaleType] = useState(1);
  const [buyNow, setBuyNow] = useState(false);

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

  const costOnChange = useCallback((e) => {
    setSalePrice(e.target.value)
  }, [setSalePrice]);

  useEffect(() => {
    if (!myNftPageListDialog) router.push(`/nfts`);
  }, [])

  useEffect(() => {
    async function asyncFunc() {
      if (myNftPageListDialog) {
        await getInitialProps();
      } else {
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

  const listDialogSetApprovalForAllStep = async () => {
    try {
      const marketContractAddress = marketContract.address;
      const { contract } = myNftPageListDialog;

      const tx = await contract.setApprovalForAll(marketContractAddress, true);
      await tx.wait();
      setIsTransferEnable(true);

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
  }, [setFinalStep, salePrice])

  const closePopup = useCallback((e) => {
    e.preventDefault();
    setWaitingConfirmation(false);
    setFinalStep(false);
  }, [setFinalStep])

  return (
    <div className='nftSaleForm'>
      {isLoading ?
        (<span className="d-flex align-items-center spinner-span">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </span>)
        :
        (!isTransferEnable &&
          <DialogAlert title={'Approve Transfer'}
            buttonText={'Continue'}
            onClick={listDialogSetApprovalForAllStep}
          >
            <span>{'Ebisu\'s Bay needs approval to'}</span>
            <span>{'transfer your NFT on your behalf'}</span>
          </DialogAlert>
        )}

      {!myNftPageListDialog && !isLoading && <DialogAlert
        title='Success!'
        buttonText='View in Listings'
        onClick={() => router.push(`/nfts`)}
      >
        <span>{`The sale for ${nftName} on`}</span>
        <span>{`${moment(new Date()).format('MM/DD/YYYY')}`}</span>
        <span>{'has been submitted for listing'}</span>
      </DialogAlert>}

      {myNftPageListDialog && !isLoading && <>
        <h2>VIP Founding Member Listing Details</h2>
        <div className='formContainer'>
          <form className='saleForm'>
            <div className='left-column'>

              <h3>Sale Type</h3>

              <div className='buttonGroup'>
                <div className={`card form_icon_button shadow first-button ${saleType === 0 ? 'active' : ''}`} onClick={() => changeSaleType('auction')}>
                  {saleType === 0 && <DotIcon icon={faCheck} />}
                  <FontAwesomeIcon className='icon' icon={faClock} />
                  <p>Auction</p>
                </div>

                <div className={`card form_icon_button shadow ${saleType === 1 ? 'active' : ''}`} onClick={() => changeSaleType('fixedPrice')}>
                  {saleType === 1 && <DotIcon icon={faCheck} />}
                  <FontAwesomeIcon className='icon' icon={faDollarSign} />
                  <p>Fixed Price</p>
                </div>
              </div>

              <Form.Group className='form-field mb-3'>
                <div className='label-container'>
                  <Form.Label className='formLabel'>{saleType === 1 ? 'Sales Price' : 'Starting Bid Price'}</Form.Label>
                </div>
                <Form.Control className='input' type='number' placeholder='Enter Text' value={salePrice} onChange={costOnChange} />
                <Form.Text className='field-description textError'>
                  {priceError && 'The entered value must be greater than zero'}
                </Form.Text>
              </Form.Group>

              {saleType === 0 &&
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

            {finalStep && (
              <span ref={ref}>
                <DialogAlert
                  title='Enable Listing'
                  buttonText='Please confirm transaction in your wallet'
                  onClick={listDialogConfirmListingStep}
                  closePopup={closePopup}
                  isWaiting={waitingConfirmation}
                >
                  <span>Before you can list your NFT, you must grant access with your wallet</span>
                  {floorPrice !== 0 && ((floorPrice - Number(salePrice)) / floorPrice) * 100 > 5 && (
                    <span className='warningMessage'>
                      The current price is {(100 - (salePrice * 100 / floorPrice)).toFixed(1)}% below previous floor price
                    </span>
                  )}
                </DialogAlert>
              </span>
            )}
          </form>
          <div>
            <h3 className='cardTitle'>Live Preview</h3>
            <NftContainer nft={myNftPageListDialog} price={salePrice} isPreview={true} />
          </div>
        </div>
      </>}
    </div>
  )
}

export default connect(mapStateToProps)(memo(MyNFTSaleForm));