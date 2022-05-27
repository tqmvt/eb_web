import React from 'react';
import { CloseButton, Modal } from 'react-bootstrap';
import AuctionComponent from './AuctionComponent';
import { useDispatch, useSelector } from 'react-redux';
import { hideBidDialog } from '../../GlobalState/metaverseSlice';

const MetaverseBidModal = () => {
  const bidDialogVisible = useSelector((state) => state.metaverse.bidDialogVisible);
  const auctionId = useSelector((state) => state.metaverse.auctionId);
  const userTheme = useSelector((state) => state.user.theme);
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(hideBidDialog());
  };

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
          <span className="btn-main" onClick={handleClose}>
            Close
          </span>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default MetaverseBidModal;
