import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

import Collection1155 from '../../src/Components/Collection/collection1155';
import Collection721 from '../../src/Components/Collection/collection721';
import CollectionCronosverse from '../../src/Components/Collection/collectionCronosverse';
import { caseInsensitiveCompare, isCronosVerseCollection, isAddress } from '../../src/utils';
import {appConfig} from "../../src/Config";

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
      <Head>
        <title>{ssrCollection?.name || 'NFT'} | Ebisu's Bay Marketplace</title>
        <meta name="description" content={`${ssrCollection?.name || 'NFT'} for Ebisu's Bay Marketplace`} />
        <meta name="title" content={`${ssrCollection?.name || 'NFT'} | Ebisu's Bay Marketplace`} />
        <meta property="og:type" content="website" key="og_type" />
        <meta property="og:title" content={`${ssrCollection?.name || 'NFT'} | Ebisu's Bay Marketplace`} key="title" />
        <meta property="og:url" content={`https://app.ebisusbay.com/collection/${collection?.slug}`} key="og_url" />
        <meta property="og:image" content={ssrCollection?.metadata?.banner} key="image" />
        <meta property="og:description" content={ssrCollection?.metadata?.description} />
        <meta
          name="twitter:title"
          content={`${ssrCollection?.name || 'NFT'} | Ebisu's Bay Marketplace`}
          key="twitter_title"
        />
        <meta name="twitter:image" content={ssrCollection?.metadata?.banner} key="twitter_image" />
        <meta name="twitter:card" content="summary_large_image" key="misc-card" />
      </Head>
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
