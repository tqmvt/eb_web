import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
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
  Typography,
} from '@mui/material';
import { Contract, ethers } from 'ethers';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import styled from 'styled-components';
import Blockies from 'react-blockies';
import { toast } from 'react-toastify';
import { Spinner } from 'react-bootstrap';

import { OFFER_TYPE } from '../MadeOffersRow';
import EmptyData from '../EmptyData';
import { updateContractInstance, updateOfferSuccess, updateOfferFailed } from 'src/GlobalState/offerSlice';
import { shortAddress } from 'src/utils';
import CloseIcon from 'src/Assets/images/close-icon-blue.svg';
import config from 'src/Assets/networks/rpc_config.json';
import Market from 'src/Contracts/Marketplace.json';

const DialogContainer = styled(Dialog)`
  .MuiDialogContent-root {
    padding: 36px 50px !important;
    border-radius: 8px;

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

const BuyerAddress = styled.div`
  margin-top: 12px;

  & .blockies {
    border-radius: 100px;
    margin-left: 12px;
    margin-right: 8px;
  }
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

const AcceptDialogStepEnum = {
  WaitingForTransferApproval: 0,
  EnteringPrice: 1,
  ConfirmAcceptance: 2,
};

Object.freeze(AcceptDialogStepEnum);

const offerSteps = [
  {
    label: 'Approve Offer',
    description: `Ebisu's Bay needs approval to transfer your NFT on your behalf.`,
  },
  {
    label: 'Offer Price',
    description: ``,
  },
  {
    label: 'Confirm acceptance offer',
    description: 'Sign transaction to complete transfer.',
  },
];

const AcceptOfferDialog = ({ isOpen, toggle, nftData, offerData, collectionMetadata }) => {
  const dispatch = useDispatch();
  const isNftLoading = useSelector((state) => state.nft.loading);
  const walletProvider = useSelector((state) => state.user.provider);
  const contractInstance = useSelector((state) => state.offer.contract);
  const offerContract = useSelector((state) => state.user.offerContract);
  const walletAddress = useSelector((state) => state.user.address);

  const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
  const readMarket = new Contract(config.market_contract, Market.abi, readProvider);

  const [fee, setFee] = useState(0);
  const [royalty, setRoyalty] = useState(0);

  const [floorPrice, setFloorPrice] = useState(0);
  const [belowFloor, setBelowFloor] = useState(false);

  // get royalty
  useEffect(() => {
    async function asyncFunc() {
      const fees = await readMarket.fee(walletAddress);
      const royalties = await readMarket.royalties(nftData.address);
      setFee((fees / 10000) * 100);
      setRoyalty(Math.round(royalties[1]) / 100);
    }
    if (nftData) {
      asyncFunc();
    }
    // eslint-disable-next-line
  }, [nftData]);

  // steps
  const [acceptDialogActiveStep, setAcceptDialogActiveStep] = useState(AcceptDialogStepEnum.WaitingForTransferApproval);
  const [nextEnabled, setNextEnabled] = useState(false);

  // get contract instance for nft
  useEffect(() => {
    if (nftData && nftData.address) {
      dispatch(updateContractInstance(walletProvider, nftData.address));
    }
  }, []);

  // check for approval
  useEffect(() => {
    if (contractInstance && offerContract) {
      checkApproval();
    }
  }, [contractInstance, offerContract]);

  const checkApproval = async () => {
    try {
      const isApproved = await contractInstance.isApprovedForAll(walletAddress, offerContract.address);
      if (isApproved) {
        setAcceptDialogActiveStep(AcceptDialogStepEnum.EnteringPrice);
        setNextEnabled(true);
      } else {
        // go and approve now
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

      setAcceptDialogActiveStep(AcceptDialogStepEnum.WaitingForTransferApproval);
    }
  };

  // if not approved, approve for all
  const acceptDialogSetApprovalForAllStep = async () => {
    try {
      const tx = await contractInstance.setApprovalForAll(offerContract.address, true);
      await tx.wait();

      setNextEnabled(false);
      setAcceptDialogActiveStep(AcceptDialogStepEnum.EnteringPrice);
    } catch (error) {
      if (error.data) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        console.log(error);
        toast.error('Unknown Error');
      }
      setAcceptDialogActiveStep(AcceptDialogStepEnum.WaitingForTransferApproval);
    }
  };

  const acceptDialogConfirmAcceptanceStep = async () => {
    try {
      const tx = await offerContract.acceptOffer(offerData.hash, offerData.offerIndex);
      const receipt = await tx.wait();
      dispatch(updateOfferSuccess(receipt.transactionHash, walletAddress));
      setNextEnabled(false);
    } catch (e) {
      dispatch(updateOfferFailed(e));
      setNextEnabled(true);
    }
    toggle(OFFER_TYPE.none);
  };

  const handleNext = () => {
    if (acceptDialogActiveStep === AcceptDialogStepEnum.WaitingForTransferApproval) {
      acceptDialogSetApprovalForAllStep();
    } else if (acceptDialogActiveStep === AcceptDialogStepEnum.EnteringPrice) {
      setAcceptDialogActiveStep(AcceptDialogStepEnum.ConfirmAcceptance);
    } else if (acceptDialogActiveStep === AcceptDialogStepEnum.ConfirmAcceptance) {
      acceptDialogConfirmAcceptanceStep();
    }
  };

  const getYouReceiveViewValue = () => {
    const youReceive = offerData.price - (fee / 100) * offerData.price - (royalty / 100) * offerData.price;
    return ethers.utils.commify(youReceive.toFixed(2));
  };

  return (
    <>
      <DialogContainer onClose={() => toggle(OFFER_TYPE.none)} open={isOpen}>
        {!isNftLoading ? (
          <DialogContent>
            <DialogTitleContainer>Accept Offer - {nftData.name}</DialogTitleContainer>
            <Grid container spacing={{ sm: 4 }} columns={2}>
              <Grid item xs={2} md={1} key="1">
                <Container>
                  <CardMediaContainer component="img" src={nftData.image} width="150" />
                  <BuyerAddress>
                    Buyer
                    <Blockies seed={offerData.buyer} size={6} scale={5} className="blockies" />
                    {offerData.buyer ? shortAddress(offerData.buyer) : '-'}
                  </BuyerAddress>
                </Container>
              </Grid>
              <Grid item xs={1} key="2">
                <Stepper activeStep={acceptDialogActiveStep} orientation="vertical">
                  {offerSteps.map((step, index) => (
                    <Step key={step.label}>
                      <StepLabel optional={index === 2 ? <Typography variant="caption">Last step</Typography> : null}>
                        {step.label} {index === 1 ? `${offerData.price} CRO` : ''}
                      </StepLabel>
                      <StepContent>
                        <Typography>{step.description}</Typography>
                        {index === 1 ? (
                          <Stack>
                            <Typography>
                              <strong>
                                Buyer pays:{' '}
                                <span style={{ fontSize: '18px' }}>{offerData.price ? offerData.price : 0}</span> CRO{' '}
                              </strong>
                            </Typography>
                            <Typography>Service Fee: {fee} %</Typography>
                            <Typography>Royalty Fee: {royalty} %</Typography>
                            <Typography>
                              <strong>
                                You receive: <span style={{ fontSize: '18px' }}>{getYouReceiveViewValue()}</span> CRO{' '}
                              </strong>
                            </Typography>
                          </Stack>
                        ) : null}
                        <Box sx={{ mt: 3 }}>
                          <div>
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
                          </div>
                        </Box>
                      </StepContent>
                    </Step>
                  ))}
                </Stepper>
              </Grid>
            </Grid>
          </DialogContent>
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
      </DialogContainer>
    </>
  );
};

export default AcceptOfferDialog;
