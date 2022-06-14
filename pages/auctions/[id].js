import React, {memo, useEffect, useState} from 'react';
import { useRouter } from 'next/router';

import AuctionComponent from '../../src/Components/components/AuctionComponent';
import MadAuction from "../../src/Components/Auctions/Curated/MadAuction";
import Blood4NftAuction from "../../src/Components/Auctions/Curated/Blood4NftAuction";

const Auction = () => {
  const router = useRouter();
  const { id } = router.query;

  const [component, setComponent] = useState(<></>);

  useEffect(() => {
    if (router.isReady) {
      if (id === 'mad-auction') {
        setComponent(<MadAuction />)
      } else if (id === 'blood-4-nft') {
        setComponent(<Blood4NftAuction />);
      } else {
        setComponent(<AuctionComponent id={id} />);
      }
    }
  }, [router.isReady, id]);

  return component;
};

export default memo(Auction);
