import React, { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Head from 'next/head';

import store from '../../../src/Store/store';
import { getNftDetails } from '../../../src/GlobalState/nftSlice';
import { findCollectionByAddress, humanize, relativePrecision } from '../../../src/utils';
import config from '../../../src/Assets/networks/rpc_config.json';
import Nft1155 from '../../../src/Components/Collection/nft1155';
import Nft721 from '../../../src/Components/Collection/nft721';
const knownContracts = config.known_contracts;

const Nft = ({ slug, id }) => {
  const [type, setType] = useState('721');
  const [collection, setCollection] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [initialized, setInitialized] = useState(false);

  const nft = useSelector((state) => state.nft.nft);

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
        router.push(`/collection/${col.slug}/${id}`);
      }
    }
    setInitialized(true);
  }, [slug, id]);

  const getTraits = (anNFT) => {
    if (
      (anNFT?.attributes && Array.isArray(anNFT.attributes) && anNFT.attributes.length > 0) ||
      (anNFT?.properties && Array.isArray(anNFT.properties) && anNFT.properties.length > 0)
    ) {
      let traits = [];
      if (anNFT?.attributes && Array.isArray(anNFT.attributes)) {
        traits = anNFT.attributes.filter((a) => a.value !== 'None');

        traits.sort((a, b) => {
          if (a?.occurrence) {
            return a.occurrence - b.occurrence;
          } else if (a?.percent) {
            return a.percent - b.percent;
          }
        });

        // .reduce(
        //   (previousValue, currentValue) => {
        //     if (previousValue?.occurrence) {
        //       if (relativePrecision(previousValue.occurrence) > relativePrecision(currentValue.occurrence)) {
        //         return currentValue;
        //       }
        //     } else if (previousValue?.percent) {
        //       if (previousValue.percent > currentValue.percent) {
        //         return currentValue;
        //       }
        //     }
        //   },
        //   // `${previousValue ? `${previousValue}, ` : ''}${humanize(currentValue.trait_type)}: ${
        //   //   currentValue.value ? humanize(currentValue.value) : 'N/A'
        //   // }`,
        //   anNFT.attributes[0]
        // );
      }
      if (anNFT?.properties && Array.isArray(anNFT.properties)) {
        traits = anNFT.properties;
        traits.sort((a, b) => {
          if (a?.occurrence) {
            return a.occurrence - b.occurrence;
          } else if (a?.percent) {
            return a.percent - b.percent;
          }
        });
        // .reduce(
        //   (previousValue, currentValue) => {
        //     if (previousValue?.occurrence) {
        //       if (relativePrecision(previousValue.occurrence) > relativePrecision(currentValue.occurrence)) {
        //         return currentValue;
        //       }
        //     } else if (previousValue?.percent) {
        //       if (previousValue.percent > currentValue.percent) {
        //         return currentValue;
        //       }
        //     }
        //   },
        //   // `${previousValue ? `${previousValue}, ` : ''}${humanize(currentValue.trait_type)}: ${
        //   //   currentValue.value ? humanize(currentValue.value) : 'N/A'
        //   // }`,
        //   anNFT.properties[0]
        // );
      }
      if (traits.length) {
        const traitsTop = traits[0];
        const res = `${anNFT?.description ? anNFT.description.slice(0, 250) : ''} ... Top Trait: ${
          traitsTop?.value ? humanize(traitsTop.value) : 'N/A'
        }, ${traitsTop?.occurrence || traitsTop?.percent}%`;

        return res;
      }
    }
    return anNFT?.description;
  };

  if (redirect) {
    router.push(`/collection/${redirect}/${id}`);
    return <></>;
  }

  return (
    <>
      <Head>
        <title>{nft?.name || 'NFT'} | Ebisu's Bay Marketplace</title>
        <meta name="description" content={`${nft?.name || 'NFT'} for Ebisu's Bay Marketplace`} />
        <meta name="title" content={`${nft?.name || 'NFT'} | Ebisu's Bay Marketplace`} />
        <meta property="og:type" content="website" key="og_type" />
        <meta property="og:title" content={`${nft?.name || 'NFT'} | Ebisu's Bay Marketplace`} key="title" />
        <meta property="og:url" content={`https://app.ebisusbay.com/nft/${collection?.address}`} key="og_url" />
        <meta property="og:image" content={nft?.image} key="image" />
        <meta property="og:description" content={getTraits(nft)} />
        <meta name="twitter:title" content={`${nft?.name || 'NFT'} | Ebisu's Bay Marketplace`} key="twitter_title" />
        <meta name="twitter:image" content={nft?.image} key="twitter_image" />
        <meta name="twitter:card" content="summary_large_image" key="misc-card" />
      </Head>
      {initialized && collection && (
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

export const getServerSideProps = async ({ params }) => {
  const slug = params?.slug;
  const tokenId = params?.id;
  const collection = knownContracts.find((c) => c?.slug.toLowerCase() === slug.toLowerCase());
  if (collection?.address) {
    await store.dispatch(getNftDetails(collection.address, tokenId));
  }

  return {
    props: {
      slug: collection?.slug,
      id: tokenId,
      collection,
    },
  };
};

export default memo(Nft);
