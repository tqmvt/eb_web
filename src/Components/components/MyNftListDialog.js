import React, { memo, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  Box,
  CardMedia,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Stack,
  Step,
  StepContent,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import { toast } from 'react-toastify';
import { ethers } from 'ethers';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';

import { MyNftPageActions } from '../../GlobalState/User';
import { getCollectionMetadata } from '../../core/api';
import {isEventValidNumber} from "../../utils";
// import { numberToWords } from 'number-to-words';

const StyledTypography = styled(Typography)`
  color: ${({ theme }) => theme.colors.textColor3};
`;

const StyledStepLabel = styled(StepLabel)`
  .MuiStepLabel-label,
  .MuiStepLabel-label.Mui-active,
  .MuiStepLabel-label.Mui-completed {
    color: ${({ theme }) => theme.colors.textColor3};
  }
`;

const StyledTextField = styled(TextField)`
  .MuiInputBase-input,
  .MuiInputLabel-root {
    color: ${({ theme }) => theme.colors.textColor3};
  }
`;

const DialogContainer = styled(Dialog)`
  .MuiPaper-root {
    border-radius: 8px;
    overflow: hidden;
    background-color: ${({ theme }) => theme.colors.bgColor1};
  }

  .MuiDialogContent-root {
    padding: 36px 50px !important;
    border-radius: 8px;
    background-color: ${({ theme }) => theme.colors.bgColor1};

    @media only screen and (max-width: ${({ theme }) => theme.breakpoints.md}) {
      width: 100%;
    }
  }
`;

const DialogTitleContainer = styled(DialogTitle)`
  font-size: 18px !important;
  color: ${({ theme }) => theme.colors.textColor3};
  padding: 0px 24px !important;
  margin-bottom: 12px !important;
  font-weight: bold !important;
  text-align: left;
`;

const CardMediaContainer = styled(CardMedia)`
  border-radius: 6px;
`;

const ListDialogStepEnum = {
  WaitingForTransferApproval: 0,
  EnteringPrice: 1,
  ConfirmPrice: 2,
  ConfirmListing: 3,
};

Object.freeze(ListDialogStepEnum);

const mapStateToProps = (state) => ({
  walletAddress: state.user.address,
  marketContract: state.user.marketContract,
  myNftPageListDialog: state.user.myNftPageListDialog,
});

const MyNftListDialog = ({ walletAddress, marketContract, myNftPageListDialog }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    async function asyncFunc() {
      if (myNftPageListDialog) {
        await showListDialog();
      } else {
        setListDialogActiveStep(ListDialogStepEnum.WaitingForTransferApproval);
      }
    }
    asyncFunc();
    // eslint-disable-next-line
  }, [myNftPageListDialog]);

  const [salePrice, setSalePrice] = useState(0);
  const [priceError, setPriceError] = useState('');

  const onListingDialogPriceValueChange = (inputEvent) => {
    setSalePrice(inputEvent.target.value);
  };

  const listingSteps = [
    {
      label: 'Approve Transfer',
      description: `Ebisu's Bay needs approval to transfer your NFT on your behalf.`,
    },
    {
      label: 'Enter Price',
      description: `Enter the listing price in CRO.`,
    },
    {
      label: 'Confirm Price',
      description: '',
    },
    {
      label: 'Confirm Listing',
      description: 'Sign transaction to complete listing.',
    },
  ];

  const [listDialogActiveStep, setListDialogActiveStep] = useState(ListDialogStepEnum.WaitingForTransferApproval);
  const [nextEnabled, setNextEnabled] = useState(false);

  const [fee, setFee] = useState(0);
  const [royalty, setRoyalty] = useState(0);

  const [floorPrice, setFloorPrice] = useState(0);
  // const [belowFloor, setBelowFloor] = useState(false);

  useEffect(() => {
    const re = /^[0-9\b]+$/;
    if (salePrice && salePrice.length > 0 && salePrice[0] !== '0' && re.test(salePrice)) {
      setPriceError('');
      setNextEnabled(true);
      // if (salePrice != null) {
      //   if (salePrice <= floorPrice) {
      //     setBelowFloor(true);
      //   }
      // }
    } else {
      if (salePrice !== '' && salePrice !== null) {
        setPriceError('Price must only contain full numbers!');
      }
      setNextEnabled(false);
    }
  }, [salePrice]);

  const showListDialog = async () => {
    try {
      const marketContractAddress = marketContract.address;

      const { contract, /*id, image, name,*/ address } = myNftPageListDialog;

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
        setListDialogActiveStep(ListDialogStepEnum.EnteringPrice);
      } else {
        setNextEnabled(true);
      }
    } catch (error) {
      if (error.data) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        console.log(error);
        toast.error('Unknown Error');
      }
      setListDialogActiveStep(ListDialogStepEnum.WaitingForTransferApproval);
    }
  };

  const listDialogSetApprovalForAllStep = async () => {
    try {
      const marketContractAddress = marketContract.address;
      const { contract } = myNftPageListDialog;

      const tx = await contract.setApprovalForAll(marketContractAddress, true);
      await tx.wait();

      setNextEnabled(false);
      setListDialogActiveStep(ListDialogStepEnum.EnteringPrice);
    } catch (error) {
      if (error.data) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        console.log(error);
        toast.error('Unknown Error');
      }
      setListDialogActiveStep(ListDialogStepEnum.WaitingForTransferApproval);
    }
  };

  const listDialogConfirmListingStep = async () => {
    const { contract } = myNftPageListDialog;

    const nftId = myNftPageListDialog.id;

    setNextEnabled(false);

    dispatch(
      MyNftPageActions.listingDialogConfirm({
        contractAddress: contract.address,
        nftId,
        salePrice,
        marketContract,
      })
    );
  };

  const cancelList = () => {
    //  TODO: Dialog should more generic
    dispatch(MyNftPageActions.hideMyNftPageListDialog());
    setListDialogActiveStep(ListDialogStepEnum.WaitingForTransferApproval);
    setNextEnabled(false);
    setPriceError('');
    setFloorPrice(0);
    // setBelowFloor(false);
    setSalePrice(null);
  };

  const handleNext = () => {
    if (listDialogActiveStep === ListDialogStepEnum.WaitingForTransferApproval) {
      listDialogSetApprovalForAllStep();
    } else if (listDialogActiveStep === ListDialogStepEnum.EnteringPrice) {
      setListDialogActiveStep(ListDialogStepEnum.ConfirmPrice);
    } else if (listDialogActiveStep === ListDialogStepEnum.ConfirmPrice) {
      setListDialogActiveStep(ListDialogStepEnum.ConfirmListing);
    } else if (listDialogActiveStep === ListDialogStepEnum.ConfirmListing) {
      listDialogConfirmListingStep();
    }
  };

  const handlePrevious = () => {
    setListDialogActiveStep(ListDialogStepEnum.EnteringPrice);
  };

  const getYouReceiveViewValue = () => {
    const youReceive = salePrice - (fee / 100) * salePrice - (royalty / 100) * salePrice;
    return ethers.utils.commify(youReceive.toFixed(2));
  };

  return (
    <>
      {myNftPageListDialog ? (
        <DialogContainer onClose={cancelList} open={!!myNftPageListDialog}>
          <DialogContent>
            <DialogTitleContainer>List {myNftPageListDialog.name}</DialogTitleContainer>
            <Grid container spacing={{ sm: 4 }} columns={2}>
              <Grid item xs={2} md={1} key="1">
                <Container>
                  <CardMediaContainer component="img" src={myNftPageListDialog.image} width="150" />
                </Container>
              </Grid>
              <Grid item md={1} key="2">
                <Stepper activeStep={listDialogActiveStep} orientation="vertical">
                  {listingSteps.map((step, index) => (
                    <Step key={step.label}>
                      <StyledStepLabel
                        optional={index === 3 ? <StyledTypography variant="caption">Last step</StyledTypography> : null}
                      >
                        {step.label}
                      </StyledStepLabel>
                      <StepContent>
                        <StyledTypography>{step.description}</StyledTypography>
                        {index === 1 ? (
                          <Stack>
                            <StyledTextField
                              sx={{ marginTop: '10px', marginBottom: '10px' }}
                              type="number"
                              label="Price"
                              variant="outlined"
                              onKeyDown={(e) => {
                                if (!isEventValidNumber(e)) {
                                  e.preventDefault();
                                }
                              }}
                              onChange={(e) => {
                                onListingDialogPriceValueChange(e);
                              }}
                            />
                            <StyledTypography sx={{ color: 'red' }}>
                              <strong>{priceError}</strong>
                            </StyledTypography>
                            <StyledTypography>
                              <strong>
                                {' '}
                                Buyer pays:{' '}
                                <span style={{ fontSize: '18px' }}>
                                  {salePrice ? ethers.utils.commify(salePrice) : 0}
                                </span>{' '}
                                CRO{' '}
                              </strong>
                            </StyledTypography>
                            <StyledTypography>Service Fee: {fee} %</StyledTypography>
                            <StyledTypography>Royalty Fee: {royalty} %</StyledTypography>
                            <StyledTypography>
                              <strong>
                                {' '}
                                You receive: <span style={{ fontSize: '18px' }}>
                                  {getYouReceiveViewValue()}
                                </span> CRO{' '}
                              </strong>
                            </StyledTypography>
                          </Stack>
                        ) : null}
                        {index === 2 ? (
                          <Stack>
                            {floorPrice !== 0 && ((floorPrice - Number(salePrice)) / floorPrice) * 100 > 5 && (
                              <>
                                <StyledTypography sx={{ color: 'red' }}>
                                  <strong>
                                    {(((floorPrice - Number(salePrice)) / floorPrice) * 100).toFixed(1)}% BELOW FLOOR
                                    PRICE
                                  </strong>
                                </StyledTypography>
                              </>
                            )}
                            {floorPrice !== 0 && (
                              <StyledTypography sx={{ color: '#750b1c' }}>
                                <strong>Floor price: {floorPrice} CRO</strong>
                              </StyledTypography>
                            )}
                            <StyledTypography>
                              <strong>
                                {' '}
                                Buyer pays:{' '}
                                <span style={{ fontSize: '18px' }}>
                                  {salePrice ? ethers.utils.commify(salePrice) : 0}
                                </span>{' '}
                                CRO{' '}
                              </strong>
                            </StyledTypography>
                            <StyledTypography>Service Fee: {fee} %</StyledTypography>
                            <StyledTypography>Royalty Fee: {royalty} %</StyledTypography>
                            <StyledTypography>
                              <strong>
                                {' '}
                                You receive: <span style={{ fontSize: '18px' }}>
                                  {getYouReceiveViewValue()}
                                </span> CRO{' '}
                              </strong>
                            </StyledTypography>
                            {/*
                            {salePrice && (
                            <StyledTypography>
                              <strong>
                                { numberToWords.toWords(salePrice) }
                              </strong>
                            </StyledTypography>
                            )} */}
                          </Stack>
                        ) : null}
                        {index === 3 ? (
                          <Stack>
                            <StyledTypography>
                              <strong>
                                {' '}
                                Buyer pays:{' '}
                                <span style={{ fontSize: '18px' }}>
                                  {salePrice ? ethers.utils.commify(salePrice) : 0}
                                </span>{' '}
                                CRO{' '}
                              </strong>
                            </StyledTypography>
                            <StyledTypography>Service Fee: {fee} %</StyledTypography>
                            <StyledTypography>Royalty Fee: {royalty} %</StyledTypography>
                            <StyledTypography>
                              <strong>
                                {' '}
                                You receive: <span style={{ fontSize: '18px' }}>
                                  {getYouReceiveViewValue()}
                                </span> CRO{' '}
                              </strong>
                            </StyledTypography>
                          </Stack>
                        ) : null}
                        <Box sx={{ mt: 3 }}>
                          <div>
                            {index === 2 ? (
                              <>
                                <button
                                  style={{ background: 'red' }}
                                  className="btn-warning lead mb-2 mr15"
                                  disabled={!nextEnabled}
                                  onClick={handlePrevious}
                                >
                                  Return
                                </button>
                                <button
                                  className="btn-success lead mb-2 mr15"
                                  disabled={!nextEnabled}
                                  onClick={handleNext}
                                >
                                  I accept, Continue
                                </button>
                              </>
                            ) : (
                              <button className="btn-main lead mb-5 mr15" disabled={!nextEnabled} onClick={handleNext}>
                                {!nextEnabled && index !== 1 ? (
                                  <span className="d-flex align-items-center">
                                    <FontAwesomeIcon icon={faSpinner} className="fa-spin" />
                                    <span className="ps-2">Working...</span>
                                  </span>
                                ) : (
                                  <>{index === listingSteps.length - 1 ? 'Finish' : 'Continue'}</>
                                )}
                              </button>
                            )}
                          </div>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Grid>
            </Grid>
          </DialogContent>
        </DialogContainer>
      ) : null}
    </>
  );
};

export default connect(mapStateToProps)(memo(MyNftListDialog));
