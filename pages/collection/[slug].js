import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Collection1155 from '../../src/Components/Collection/collection1155';
import Collection721 from '../../src/Components/Collection/collection721';
import CollectionCronosverse from '../../src/Components/Collection/collectionCronosverse';
import {caseInsensitiveCompare, isCronosVerseCollection, isAddress, isCollection} from '../../src/utils';
import {appConfig} from "../../src/Config";
import PageHead from "../../src/Components/components/PageHead";

const knownContracts = appConfig('collections')

const collectionTypes = {
  UNSET: -1,
  ERC721: 0,
  ERC1155: 1,
  CRONOSVERSE: 2,
};

const Collection = ({ ssrCollection }) => {
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
        router.push(`/collection/${col.slug}`);
      }
    }
    setInitialized(true);
  }, [slug]);

  if (redirect) {
    if (typeof window !== 'undefined') {
      router.push(`/collection/${redirect}`);
      return <></>;
    }
  }

  return (
    <>
      <PageHead
        title={ssrCollection.name}
        description={ssrCollection.metadata.description}
        url={`/collection/${ssrCollection.slug}`}
        image={ssrCollection.metadata.card}
      />
      {initialized && collection && (
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

export const getServerSideProps = async ({ params }) => {
  const slug = params?.slug;
  let collection;
  if (isAddress(slug)) {
    collection = knownContracts.find((c) => c?.address.toLowerCase() === slug.toLowerCase());
  } else {
    collection = knownContracts.find((c) => c?.slug.toLowerCase() === slug.toLowerCase());
  }

  if (!collection) {
    return {
      notFound: true
    }
  }

  if (isAddress(slug)) {
    return {
      redirect: {
        destination: `/collection/${collection.slug}`,
        permanent: false,
      },
      props: {
        slug: collection?.slug,
        ssrCollection: collection,
      },
    };
  }

  return {
    props: {
      slug: collection?.slug,
      ssrCollection: collection,
    },
  };
};

export default Collection;
