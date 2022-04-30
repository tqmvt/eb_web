import React, { memo, useEffect, useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import {
  Button,
  CardMedia,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  TextField,
} from '@mui/material';
import styled from 'styled-components';

import { MyNftPageActions } from '../../GlobalState/User';

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

const StyledTextField = styled(TextField)`
  .MuiInputBase-input,
  .MuiInputLabel-root {
    color: ${({ theme }) => theme.colors.textColor3};
  }
`;

const ListDialogStepEnum = {
  WaitingForTransferApproval: 0,
  EnteringPrice: 1,
  ConfirmListing: 2,
};

Object.freeze(ListDialogStepEnum);

const mapStateToProps = (state) => ({
  walletAddress: state.user.address,
  myNftPageTransferDialog: state.user.myNftPageTransferDialog,
});

const MyNftTransferDialog = ({ walletAddress, myNftPageTransferDialog }) => {
  const dispatch = useDispatch();

  const [transferAddress, setTransferAddress] = useState(null);

  useEffect(() => {
    if (!myNftPageTransferDialog) {
      setTransferAddress(null);
    }
  }, [myNftPageTransferDialog]);

  const onTransferDialogAddressValueChange = (inputEvent) => {
    const address = inputEvent.target.value;
    setTransferAddress(address);
  };

  const onTransferDialogConfirm = async () => {
    dispatch(MyNftPageActions.transferDialogConfirm(myNftPageTransferDialog, walletAddress, transferAddress));
  };

  const onTransferDialogCancel = () => {
    dispatch(MyNftPageActions.hideMyNftPageTransferDialog());
  };

  return (
    <>
      {myNftPageTransferDialog ? (
        <DialogContainer onClose={onTransferDialogCancel} open={!!myNftPageTransferDialog}>
          <DialogContent>
            <DialogTitle>Start Transfer</DialogTitle>
            <Grid container spacing={{ sm: 4 }} columns={2}>
              <Grid item xs={2} md={1} key="1">
                <Container>
                  <CardMedia component="img" src={myNftPageTransferDialog.image} width="150" />
                </Container>
              </Grid>
              <Grid item xs={1} key="2">
                <StyledTextField label="Address" variant="outlined" onChange={onTransferDialogAddressValueChange} />
              </Grid>
            </Grid>

            <DialogActions>
              <Button onClick={onTransferDialogCancel}>Cancel</Button>
              <Button onClick={onTransferDialogConfirm}>OK</Button>
            </DialogActions>
          </DialogContent>
        </DialogContainer>
      ) : null}
    </>
  );
};

export default connect(mapStateToProps)(memo(MyNftTransferDialog));
