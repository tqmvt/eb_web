import React, { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
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
import { ethers } from 'ethers';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const AcceptDialogStepEnum = {
  WaitingForTransferApproval: 0,
  EnteringPrice: 1,
  ConfirmPrice: 2,
  ConfirmAcceptance: 3,
};

Object.freeze(AcceptDialogStepEnum);

const AcceptOfferDialog = ({ isOpen, toggle, nftData, address, collectionMetadata }) => {
  const dispatch = useDispatch();

  const [salePrice, setSalePrice] = useState(0);
  const [priceError, setPriceError] = useState('');

  const onAcceptDialogPriceValueChange = (inputEvent) => {
    setSalePrice(inputEvent.target.value);
  };

  const offerSteps = [
    {
      label: 'Approve Offer',
      description: `Ebisu's Bay needs approval to transfer your NFT on your behalf.`,
    },
    {
      label: 'Offer Price',
      description: `Enter the offer price in CRO.`,
    },
    {
      label: 'Confirm Price',
      description: '',
    },
    {
      label: 'Confirm acceptance offer',
      description: 'Sign transaction to complete transfer.',
    },
  ];

  const [acceptDialogActiveStep, setAcceptDialogActiveStep] = useState(AcceptDialogStepEnum.WaitingForTransferApproval);
  const [nextEnabled, setNextEnabled] = useState(false);

  const [fee, setFee] = useState(0);
  const [royalty, setRoyalty] = useState(0);

  const [floorPrice, setFloorPrice] = useState(0);
  const [belowFloor, setBelowFloor] = useState(false);

  useEffect(() => {
    const re = /^[0-9\b]+$/;
    if (salePrice && salePrice.length > 0 && salePrice[0] !== '0' && re.test(salePrice)) {
      setPriceError('');
      setNextEnabled(true);
      if (salePrice != null) {
        if (salePrice <= floorPrice) {
          setBelowFloor(true);
        }
      }
    } else {
      if (salePrice != '' && salePrice != null) {
        setPriceError('Price must only contain full numbers!');
      }
      setNextEnabled(false);
    }
  }, [salePrice]);

  const acceptDialogSetApprovalForAllStep = async () => {
    setAcceptDialogActiveStep(AcceptDialogStepEnum.EnteringPrice);
  };

  const acceptDialogConfirmAcceptanceStep = async () => {
    setNextEnabled(false);
  };

  const handleNext = () => {
    if (acceptDialogActiveStep === AcceptDialogStepEnum.WaitingForTransferApproval) {
      acceptDialogSetApprovalForAllStep();
    } else if (acceptDialogActiveStep === AcceptDialogStepEnum.EnteringPrice) {
      setAcceptDialogActiveStep(AcceptDialogStepEnum.ConfirmPrice);
    } else if (acceptDialogActiveStep === AcceptDialogStepEnum.ConfirmPrice) {
      setAcceptDialogActiveStep(AcceptDialogStepEnum.ConfirmAcceptance);
    } else if (acceptDialogActiveStep === AcceptDialogStepEnum.ConfirmAcceptance) {
      acceptDialogConfirmAcceptanceStep();
    }
  };

  const handlePrevious = () => {
    setAcceptDialogActiveStep(AcceptDialogStepEnum.EnteringPrice);
  };

  const getYouReceiveViewValue = () => {
    const youReceive = salePrice - (fee / 100) * salePrice - (royalty / 100) * salePrice;
    return ethers.utils.commify(youReceive.toFixed(2));
  };

  return (
    <>
      <Dialog onClose={toggle} open={isOpen}>
        <DialogContent>
          <DialogTitle>Accept offer {nftData.nft.name}</DialogTitle>
          <Grid container spacing={{ sm: 4 }} columns={2}>
            <Grid item xs={2} md={1} key="1">
              <Container>
                <CardMedia component="img" src={nftData.nft.original_image} width="150" />
              </Container>
            </Grid>
            <Grid item xs={1} key="2">
              <Stepper activeStep={acceptDialogActiveStep} orientation="vertical">
                {offerSteps.map((step, index) => (
                  <Step key={step.label}>
                    <StepLabel optional={index === 3 ? <Typography variant="caption">Last step</Typography> : null}>
                      {step.label}
                    </StepLabel>
                    <StepContent>
                      <Typography>{step.description}</Typography>
                      {index === 1 ? (
                        <Stack>
                          <TextField
                            sx={{ marginTop: '10px', marginBottom: '10px' }}
                            type="number"
                            label="Price"
                            variant="outlined"
                            onKeyDown={(e) => {
                              if (e.code === 'Period') {
                                e.preventDefault();
                              }
                            }}
                            onChange={(e) => {
                              onAcceptDialogPriceValueChange(e);
                            }}
                          />
                          <Typography sx={{ color: 'red' }}>
                            <strong>{priceError}</strong>
                          </Typography>
                          <Typography>
                            <strong>
                              {' '}
                              Buyer pays:{' '}
                              <span style={{ fontSize: '18px' }}>
                                {salePrice ? ethers.utils.commify(salePrice) : 0}
                              </span>{' '}
                              CRO{' '}
                            </strong>
                          </Typography>
                          <Typography>Service Fee: {fee} %</Typography>
                          <Typography>Royalty Fee: {royalty} %</Typography>
                          <Typography>
                            <strong>
                              {' '}
                              You receive: <span style={{ fontSize: '18px' }}>{getYouReceiveViewValue()}</span> CRO{' '}
                            </strong>
                          </Typography>
                        </Stack>
                      ) : null}
                      {index === 2 ? (
                        <Stack>
                          {floorPrice !== 0 && ((floorPrice - Number(salePrice)) / floorPrice) * 100 > 5 && (
                            <>
                              <Typography sx={{ color: 'red' }}>
                                <strong>
                                  {(((floorPrice - Number(salePrice)) / floorPrice) * 100).toFixed(1)}% BELOW FLOOR
                                  PRICE
                                </strong>
                              </Typography>
                            </>
                          )}
                          {floorPrice !== 0 && (
                            <Typography sx={{ color: '#750b1c' }}>
                              <strong>Floor price: {floorPrice} CRO</strong>
                            </Typography>
                          )}
                          <Typography>
                            <strong>
                              {' '}
                              Buyer pays:{' '}
                              <span style={{ fontSize: '18px' }}>
                                {salePrice ? ethers.utils.commify(salePrice) : 0}
                              </span>{' '}
                              CRO{' '}
                            </strong>
                          </Typography>
                          <Typography>Service Fee: {fee} %</Typography>
                          <Typography>Royalty Fee: {royalty} %</Typography>
                          <Typography>
                            <strong>
                              {' '}
                              You receive: <span style={{ fontSize: '18px' }}>{getYouReceiveViewValue()}</span> CRO{' '}
                            </strong>
                          </Typography>
                        </Stack>
                      ) : null}
                      {index === 3 ? (
                        <Stack>
                          <Typography>
                            <strong>
                              {' '}
                              Buyer pays:{' '}
                              <span style={{ fontSize: '18px' }}>
                                {salePrice ? ethers.utils.commify(salePrice) : 0}
                              </span>{' '}
                              CRO{' '}
                            </strong>
                          </Typography>
                          <Typography>Service Fee: {fee} %</Typography>
                          <Typography>Royalty Fee: {royalty} %</Typography>
                          <Typography>
                            <strong>
                              {' '}
                              You receive: <span style={{ fontSize: '18px' }}>{getYouReceiveViewValue()}</span> CRO{' '}
                            </strong>
                          </Typography>
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
                                <>{index === offerSteps.length - 1 ? 'Finish' : 'Continue'}</>
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
      </Dialog>
    </>
  );
};

export default AcceptOfferDialog;
