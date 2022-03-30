import React from 'react';
import OffersRow from './OffersRow';

const data = {
  address: '0x89dB...1C56',
  offerDate: '15.11.2022',
  offerPrice: '1500 CRO',
};

export default function NFTTabOffers() {
  return (
    <div>
      {/* <OffersRow data={data} type="Received" />
      <OffersRow data={data} type="Received" />
      <OffersRow data={data} type="Made" />
      <OffersRow data={data} type="Made" /> */}
      <OffersRow data={data} type="Observer" />
      <OffersRow data={data} type="Observer" />
    </div>
  );
}
