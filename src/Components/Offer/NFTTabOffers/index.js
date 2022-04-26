import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner } from 'react-bootstrap';

import OffersRow from './OffersRow';
import EmptyData from '../EmptyData';
import { fetchOffersForSingleNFT } from 'src/GlobalState/offerSlice';

export const ROW_TYPE = {
  made: 'Made',
  received: 'Received',
  observer: 'Observer',
};

export default function NFTTabOffers({ nftAddress, nftId }) {
  const nftOffersLoading = useSelector((state) => state.offer.offersForSingleNFTLoading);
  const nftOffers = useSelector((state) => state.offer.offersForSingleNFT);
  const dispatch = useDispatch();

  useEffect(() => {
    if (nftAddress && nftId) {
      dispatch(fetchOffersForSingleNFT(nftAddress, nftId));
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      {nftOffers.length > 0 ? (
        nftOffers.map((offer, index) => <OffersRow key={index} data={offer} type={ROW_TYPE.observer} />)
      ) : nftOffersLoading ? (
        <EmptyData>
          <Spinner animation="border" role="status" size="sm">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </EmptyData>
      ) : (
        <span>No offers found for this item</span>
      )}
    </div>
  );
}
