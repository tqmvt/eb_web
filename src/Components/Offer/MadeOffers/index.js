import React from 'react';
import TableHeader from '../MadeOffersHeader';
import TableRow from '../MadeOffersRow';

export default function MadeOffers({ offers }) {
  return (
    <div>
      <TableHeader />
      {offers.map((offer, index) => (
        <TableRow key={index} data={offer} type="Made" />
      ))}
    </div>
  );
}
