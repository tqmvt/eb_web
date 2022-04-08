import React from 'react';
import { Spinner } from 'react-bootstrap';

import EmptyData from '../EmptyData';
import TableHeader from '../MadeOffersHeader';
import TableRow from '../MadeOffersRow';

export default function MadeOffers({ offers, isLoading }) {
  return (
    <div>
      <TableHeader />
      {offers.length > 0 ? (
        offers.map((offer, index) => <TableRow key={index} data={offer} type="Made" />)
      ) : (
        <EmptyData>
          {isLoading ? (
            <Spinner animation="border" role="status" size="sm">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          ) : (
            'No offers found'
          )}
        </EmptyData>
      )}
    </div>
  );
}
