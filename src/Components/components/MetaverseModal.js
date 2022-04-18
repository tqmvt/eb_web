import React, { useState } from 'react';
import { Modal } from 'react-bootstrap';
import MetaverseBidModal from "./MetaverseBidModal";
import { showBidDialog} from "../../GlobalState/metaverseSlice";
import store from "../../Store/store";


function getMetaverseUrl() {
  if (window.location.host === "localhost:3000") {
    return "https://localhost:8080/hub.html?hub_id=QWSxfEv&embed_token=null"
  }
  if (window.location.host === "app.ebisusbay.biz") {
    return "https://metaverse.ebisusbay.biz/?assignRoom=true"
  }
  if (window.location.host === "testapp.ebisusbay.biz") {
    return "https://testmetaverse.ebisusbay.biz/?assignRoom=true"
  }
  if (window.location.host === "testapp2.ebisusbay.biz") {
    return "https://testmetaverse.ebisusbay.biz?assignRoom=true"
  }
  return "https://metaverse.ebisusbay.com/?assignRoom=true"
}


const MetaverseModal = (props) => {
  const  { id } = props;

  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  const metaverseUrl = getMetaverseUrl()

  return (
    <>
      <button className="btn-main lead mr15 mx-auto" onClick={handleShow}>
        Enter Metaverse
      </button>

      <Modal show={show} fullscreen onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Metaverse</Modal.Title>
        </Modal.Header>
        <Modal.Body className="pt-0 pb-0 px-0">
          <iframe src={metaverseUrl} className="metaverse" allow="microphone; camera; vr; speaker;" />
        </Modal.Body>
        <Modal.Footer>
          <span className="btn-main" onClick={handleClose}>
            Close
          </span>
          <MetaverseBidModal id={id} />
        </Modal.Footer>
      </Modal>
    </>
  );
};


function addIFrameEventListener() {
  // Here "addEventListener" is for standards-compliant web browsers and "attachEvent" is for IE Browsers.
  const eventMethod = window.addEventListener ? "addEventListener" : "attachEvent";
  const eventFunction = window[eventMethod];
  const messageEvent = eventMethod === "attachEvent" ? "onmessage" : "message";

  // Listen to message from child IFrame window
  eventFunction(
    messageEvent,
    function(e) {
      if (e.data.startsWith && e.data.startsWith("{") && e.data.endsWith("}")) {
        const message = JSON.parse(e.data)
        if (message.operation === "bid") {
          store.dispatch(showBidDialog({auctionId: message.auctionId}))
        }
      }
    },
    false
  );
}

addIFrameEventListener();

export default MetaverseModal;
