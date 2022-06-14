import React, {memo, useEffect, useState} from 'react';
import { useRouter } from 'next/router';

import AuctionComponent from '../../src/Components/components/AuctionComponent';
import MadAuction from "../../src/Components/Auctions/Curated/MadAuction";
import Blood4NftAuction from "../../src/Components/Auctions/Curated/Blood4NftAuction";
import {isAddress} from "../../src/utils";

const Auction = ({id}) => {
  if (id === 'mad-auction') {
    return (<MadAuction />)
  } else if (id === 'blood-4-nft') {
    return (<Blood4NftAuction />);
  } else {
    return (<AuctionComponent id={id} />);
  }
};

export const getServerSideProps = async ({ params }) => {
  return {
    props: {
      id: params?.id
    },
  };
};


export default memo(Auction);
