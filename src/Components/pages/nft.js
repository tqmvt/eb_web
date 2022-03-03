import React, { memo, useEffect, useState } from 'react';
import { useParams, Redirect } from 'react-router-dom';

import config from '../../Assets/networks/rpc_config.json';
import Nft1155 from './nft1155';
import Nft721 from './nft721';
import { caseInsensitiveCompare } from '../../utils';
const knownContracts = config.known_contracts;

const Nft = () => {
  const { slug, id } = useParams();

  const [type, setType] = useState('721');
  const [collection, setCollection] = useState(null);
  const [redirect, setRedirect] = useState(false);

  useEffect(() => {
    setRedirect(false);
    let col = knownContracts.find((c) => c.slug === slug);
    if (col) {
      setCollection(col);
      setType(col.multiToken ? '1155' : '721');
      if (col.multiToken) setType(col.multiToken ? '1155' : '721');
    } else {
      col = knownContracts.find((c) => caseInsensitiveCompare(c.address, slug));
      if (col) {
        setCollection(col);
        setRedirect(true);
      }
    }
  }, [slug, id]);

  return (
    <>
      {collection && (
        <>
          {redirect ? (
            <Redirect to={`/collection/${collection.slug}/${id}`} />
          ) : (
            <>
              {type === '1155' ? (
                <Nft1155 address={collection.address} id={id} />
              ) : (
                <Nft721 address={collection.address} id={id} />
              )}
            </>
          )}
        </>
      )}
    </>
  );
};

export default memo(Nft);
