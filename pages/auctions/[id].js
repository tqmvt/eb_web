import React, { memo } from 'react';
import { useRouter } from 'next/router';

import AuctionComponent from '../../src/Components/components/AuctionComponent';

const Auction = () => {
  const router = useRouter();
  const { id } = router.query;

  return <AuctionComponent id={id} />;
};

export default memo(Auction);