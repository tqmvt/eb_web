import React, { useState } from 'react';
import { CloseButton, Modal } from 'react-bootstrap';
import MetaverseBidModal from './MetaverseBidModal';
import { showBidDialog } from '../../GlobalState/metaverseSlice';
import store from '../../Store/store';
import {useDispatch, useSelector} from "react-redux";
import {connectAccount, onLogout} from "../../GlobalState/User";
import Button from "./Button";
import Link from 'next/link';

function getMetaverseUrl() {
  if (typeof window === 'undefined') return;
  if (window.location.host === 'localhost:3000') {
    return 'https://localhost:8080/hub.html?hub_id=4QPThWJ&embed_token=null';
  }
  if (window.location.host === 'app.ebisusbay.biz') {
    return 'https://metaverse.ebisusbay.biz/?assignRoom=true';
  }
  if (window.location.host === 'testapp.ebisusbay.biz') {
    return 'https://testmetaverse.ebisusbay.biz/?assignRoom=true';
  }
  if (window.location.host === 'testapp2.ebisusbay.biz') {
    return 'https://testmetaverse.ebisusbay.biz?assignRoom=true';
  }
  return 'https://metaverse.ebisusbay.com/?assignRoom=true';
}

const MetaverseModal = (props) => {
  const { id, showAuctionPageLink } = props;
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user);
  const userTheme = useSelector((state) => state.user.theme);

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const handleLogout = () => dispatch(onLogout());
  const handleLogin = () => dispatch(connectAccount());

  const metaverseUrl = getMetaverseUrl();


  return (
    <>
      <div className="d-flex justify-content-between">
        <div className="flex-fill mx-1">
          <Button type="legacy" className="w-100" onClick={handleShow}>
            Enter Metaverse
          </Button>
        </div>
        {showAuctionPageLink && (
          <div className="flex-fill mx-1">
            <Link href="/mad-auction">
              <a>
                <Button type="legacy-outlined" className="w-100">
                  View Auctions
                </Button>
              </a>
            </Link>
          </div>
        )}
      </div>

      <Modal show={show} fullscreen onHide={handleClose}>
        <Modal.Header className="modal-background">
          <Modal.Title>Mad Meerkat Legendary Auction</Modal.Title>
          <CloseButton variant={userTheme === 'dark' ? 'white' : ''} onClick={handleClose} />
        </Modal.Header>
        <Modal.Body className="pt-0 pb-0 px-0 modal-background">
          <iframe
            src={metaverseUrl}
            className="metaverse modal-background"
            allow="microphone; camera; vr; speaker;"
            title="metaverse"
          />
        </Modal.Body>
        <Modal.Footer className="modal-background">
          <Button type="legacy" onClick={handleClose}>
            Close
          </Button>
          <MetaverseBidModal id={id} />
        </Modal.Footer>
      </Modal>
    </>
  );
};

function addIFrameEventListener() {
  if (typeof window === 'undefined') return;
  // Here "addEventListener" is for standards-compliant web browsers and "attachEvent" is for IE Browsers.
  const eventMethod = window.addEventListener ? 'addEventListener' : 'attachEvent';
  const eventFunction = window[eventMethod];
  const messageEvent = eventMethod === 'attachEvent' ? 'onmessage' : 'message';

  // Listen to message from child IFrame window
  eventFunction(
    messageEvent,
    function (e) {
      if (e.data.startsWith && e.data.startsWith('{') && e.data.endsWith('}')) {
        const message = JSON.parse(e.data);
        if (message.operation === 'bid') {
          store.dispatch(showBidDialog({ auctionId: message.auctionId }));
        }
      }
    },
    false
  );
}

addIFrameEventListener();

export default MetaverseModal;
