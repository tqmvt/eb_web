import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import Collection1155 from './collection1155';
import Collection721 from './collection721';
import config from '../../Assets/networks/rpc_config.json';
import { caseInsensitiveCompare, isCronosVerseCollection } from '../../utils';
import CollectionCronosverse from './collectionCronosverse';

const knownContracts = config.known_contracts;

const collectionTypes = {
  UNSET: -1,
  ERC721: 0,
  ERC1155: 1,
  CRONOSVERSE: 2,
};

const Collection = () => {
  if (typeof window === 'undefined') {
    return;
  }
  const router = useRouter();
  const { slug } = router.query;

  const [type, setType] = useState(collectionTypes.ERC721);
  const [collection, setCollection] = useState(null);
  const [redirect, setRedirect] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    setRedirect(null);
    let col = knownContracts.find((c) => c.slug === slug);
    if (col) {
      if (!!col.mergedWith) {
        let redirectToCollection = knownContracts.find((c) => caseInsensitiveCompare(c.address, col.mergedWith));
        setRedirect(redirectToCollection.slug);
      }
      setCollection(col);
      if (isCronosVerseCollection(col.address)) setType(collectionTypes.ERC721);
      else setType(col.multiToken ? collectionTypes.ERC1155 : collectionTypes.ERC721);
    } else {
      col = knownContracts.find((c) => caseInsensitiveCompare(c.address, slug));
      if (col) {
        setCollection(col);
        setRedirect(col.slug);
      }
    }
    setInitialized(true);
  }, [slug]);

  if (redirect) {
    router.push(`/collection/${redirect}`);
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
          {type === collectionTypes.CRONOSVERSE ? (
            <CollectionCronosverse collection={collection} slug={slug} cacheName={slug} />
          ) : type === collectionTypes.ERC1155 ? (
            <>
              {collection.split ? (
                <Collection1155 collection={collection} tokenId={collection.id} slug={slug} cacheName={slug} />
              ) : (
                <Collection1155 collection={collection} slug={slug} cacheName={slug} />
              )}
            </>
          ) : (
            <Collection721 collection={collection} slug={slug} cacheName={slug} />
          )}
        </>
      )}
    </>
  );
};

export default Collection;
