import React, { memo } from 'react';
import { useParams } from 'react-router-dom';
import AuctionComponent from '../components/AuctionComponent';

const Auction = () => {
  const { id } = useParams();

  return <AuctionComponent id={id} />;
};

export default memo(Auction);
