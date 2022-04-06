import React from 'react';
import TableHeader from '../MadeOffersHeader';
import TableRow from '../MadeOffersRow';

const data = {
  name: 'Meerkats',
  title: '#53453',
  status: 'Offer received',
  offerDate: '15.11.2022',
  owner: 'Me',
  offerPrice: '1500 CRO',
};

export default function ReceivedOffers({ offers }) {
  return (
    <div>
      <TableHeader />
      {offers.map((offer, index) => (
        <TableRow key={index} data={offer} type="Received" />
      ))}
    </div>
  );
}
