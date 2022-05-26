import React from 'react';
import { Modal } from 'react-bootstrap';
import AuctionComponent from './AuctionComponent';
import { useDispatch, useSelector } from 'react-redux';
import { hideBidDialog } from '../../GlobalState/metaverseSlice';

const MetaverseBidModal = () => {
  const bidDialogVisible = useSelector((state) => state.metaverse.bidDialogVisible);
  const auctionId = useSelector((state) => state.metaverse.auctionId);
  const dispatch = useDispatch();

  const handleClose = () => {
    dispatch(hideBidDialog());
  };

  return (
    <>
      <Modal show={bidDialogVisible} fullscreen onHide={handleClose} contentClassName="wraper">
        <Modal.Header closeButton>
          <Modal.Title>Make Auction</Modal.Title>
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
