import React from 'react';
import ListingsRow from "./ListingsRow";

export default function NFTTabListings({ listings }) {

  return (
    <div>
      {listings && listings.length > 0 ? (
        <>
          {listings.map((listing, index) => (
            <ListingsRow listing={listing} index={index} />
          ))}
        </>
      ) : (
        <>
          <span>No history found for this item</span>
        </>
      )}
    </div>
  );
}
