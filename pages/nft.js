import React, { memo, useEffect, useState } from 'react';
import { findCollectionByAddress } from '../../utils';

import config from '../../Assets/networks/rpc_config.json';
import Nft1155 from './nft1155';
import Nft721 from './nft721';
const knownContracts = config.known_contracts;

const Nft = () => {
  const router = useRouter();
  const { slug, id } = router.query;

  const [type, setType] = useState('721');
  const [collection, setCollection] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setRedirect(null);
    let col = knownContracts.find((c) => c.slug === slug);
    if (col) {
      setCollection(col);
      setType(col.multiToken ? '1155' : '721');
      if (col.multiToken) setType(col.multiToken ? '1155' : '721');
    } else {
      col = findCollectionByAddress(slug, id);
      if (col) {
        setCollection(col);
        setRedirect(col.slug);
      }
    }
    setInitialized(true);
  }, [slug, id]);

  if (redirect) {
    router.push(`/collection/${redirect}/${id}`);
    return;
  }

  if (!collection) {
    router.push('/');
    return;
  }

  return (
    <>
      {initialized && (
        <>
          {type === '1155' ? (
            <Nft1155 address={collection.address} id={id} />
          ) : (
            <Nft721 address={collection.address} id={id} />
          )}
        </>
      )}
    </>
  );
};

export default memo(Nft);
