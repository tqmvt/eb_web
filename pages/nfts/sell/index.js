import React, { memo, useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import { connect, useSelector, useDispatch } from 'react-redux';

import MyNFTSaleForm from "../../../src/Components/components/MyNFTSaleForm";
import Footer from '../../../src/Components/components/Footer';
import withAuth from '../../../src/Components/withAuth';
import { getNft, getCollectionMetadata } from '../../../src/core/api';

const NftSell = () => {
  const user = useSelector((state) => state.user);
  const router = useRouter();
  const dispatch = useDispatch();
  const { nftId, collectionId } = router.query;
  const [nft, setNft] = useState(null);
  const [floorPrice, setFloorPrice] = useState(0);

  const getMyNft = useCallback(async () => {
    const response = await getNft(collectionId, nftId);
    setNft(response.nft);
  }, [nftId, collectionId])

  const getFloorPrice = useCallback( async () => {
    const floorPrice = await getCollectionMetadata(collectionId, null, {
      type: 'collection',
      value: collectionId,
    });
    if (floorPrice.collections.length > 0) {
      setFloorPrice(floorPrice.collections[0].floorPrice ?? 0);
    }
  }, [nftId, collectionId])

  useEffect(() => {
    if(nftId && collectionId){
      getMyNft();
    }
  }, [nftId, collectionId]);

  useEffect(() => {
    if(user && collectionId){
      getFloorPrice();
    }
  }, [user, collectionId]);

  return (
    <div>
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12 text-center">
                <h1>Sell NFT</h1>
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="container">
        <div className="de_tab">
          <div className="de_tab_content">
            <MyNFTSaleForm nft={nft} floorPrice={floorPrice}/>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  )
};

export default memo(withAuth(NftSell));