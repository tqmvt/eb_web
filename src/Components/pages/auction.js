import React, { memo, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useParams, Link, Redirect } from 'react-router-dom';
import { ethers } from 'ethers';
import { Spinner } from 'react-bootstrap';
import Blockies from 'react-blockies';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons';

import { getAuctionDetails } from '../../GlobalState/auctionSlice';
import { caseInsensitiveCompare, humanize, newlineText, shortAddress, timeSince } from '../../utils';
import config from '../../Assets/networks/rpc_config.json';
import BuyerActionBar from '../Auctions/BuyerActionBar';
import ProfilePreview from '../components/ProfilePreview';
import AuctionComponent from '../components/AuctionComponent';
const knownContracts = config.known_contracts;

const Auction = () => {
  const { id } = useParams();

  return <AuctionComponent id={id} />;
};

export default memo(Auction);
