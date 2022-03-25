import React from 'react';
import TableHeader from '../MadeOffersHeader';
import TableRow from '../MadeOffersRow';

const data = {
  name: 'Meerkats',
  title: '#53453',
  status: 'Offer made',
  offerDate: '15.11.2022',
  owner: '0x84…x987',
  offerPrice: '1500 CRO',
};

export default function MadeOffers() {
  return (
    <div>
      <TableHeader />
      <TableRow data={data} type="Made" />
      <TableRow data={data} type="Made" />
      <TableRow data={data} type="Made" />
      <TableRow data={data} type="Made" />
      <TableRow data={data} type="Made" />
    </div>
  );
}
