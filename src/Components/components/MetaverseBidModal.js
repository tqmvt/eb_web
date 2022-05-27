import React from 'react';
import {CloseButton, Modal} from 'react-bootstrap';
import AuctionComponent from './AuctionComponent';
import { useDispatch, useSelector } from 'react-redux';
import { hideBidDialog } from '../../GlobalState/metaverseSlice';
import {connectAccount, onLogout} from "../../GlobalState/User";
import Button from "./Button";

const MetaverseBidModal = () => {
  const bidDialogVisible = useSelector((state) => state.metaverse.bidDialogVisible);
  const auctionId = useSelector((state) => state.metaverse.auctionId);
  const user = useSelector((state) => state.user);
  const userTheme = useSelector((state) => state.user.theme);
  const dispatch = useDispatch();

  const handleClose = () => dispatch(hideBidDialog());
  const handleLogin = () => dispatch(connectAccount());
  const handleLogout = () => dispatch(onLogout());

  return (
    <>
      <Modal show={bidDialogVisible} fullscreen onHide={handleClose} contentClassName="wraper bid-modal-content">
        <Modal.Header>
          <Modal.Title>Make Auction Bid</Modal.Title>
          <CloseButton variant={userTheme === 'dark' ? 'white' : ''} onClick={handleClose} />
        </Modal.Header>
        <Modal.Body className="pt-0 pb-0 px-0">
          <AuctionComponent id={auctionId} />
        </Modal.Body>
        <Modal.Footer>
          {user.address ? (
            <Button type="legacy-outlined" onClick={handleLogout}>
              Disconnect Wallet
            </Button>
          ) : (
            <Button type="legacy-outlined" onClick={handleLogin}>
              Connect Wallet
            </Button>
          )}
          <span className="btn-main" onClick={handleClose}>
            Close
          </span>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MetaverseBidModal;
