import React, { memo } from 'react';
import { useRouter } from 'next/router';

import AuctionComponent from '../components/AuctionComponent';

const Auction = () => {
  if (typeof window === 'undefined') {
    return;
  }
  const router = useRouter();
  const { id } = router.query;

  return <AuctionComponent id={id} />;
};

export default memo(Auction);
