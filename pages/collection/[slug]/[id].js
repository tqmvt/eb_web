import React, { memo, useEffect, useState } from 'react';
import store from '../../../src/Store/store';
import { getNftDetails } from '../../../src/GlobalState/nftSlice';
import {findCollectionByAddress, humanize, isAddress, relativePrecision} from '../../../src/utils';
import Nft1155 from '../../../src/Components/Collection/nft1155';
import Nft721 from '../../../src/Components/Collection/nft721';
import {appConfig} from "../../../src/Config";
import PageHead from "../../../src/Components/Head/PageHead";
const knownContracts = appConfig('collections')

const Nft = ({ slug, id, nft }) => {
  const [type, setType] = useState('721');
  const [collection, setCollection] = useState(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    let col = knownContracts.find((c) => c.slug === slug);
    if (col) {
      setCollection(col);
      setType(col.multiToken ? '1155' : '721');
      if (col.multiToken) setType(col.multiToken ? '1155' : '721');
    } else {
      col = findCollectionByAddress(slug, id);
      if (col) {
        setCollection(col);
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
      }

      if (traits.length > 0 && traits[0].occurrence) {
        const traitsTop = traits[0];
        const res = `${anNFT?.description ? anNFT.description.slice(0, 250) : ''} ... Top Trait: ${
          traitsTop.value ? humanize(traitsTop.value) : 'N/A'
        }, ${relativePrecision(traitsTop.occurrence)}%`;

        return res;
      }

      return anNFT?.description;
    }

    return anNFT?.description;
  };

  return (
    <>
      <PageHead
        title={nft.name}
        description={getTraits(nft)}
        url={`/collection/${collection?.slug}/${nft.id}`}
        image={nft.image}
      />
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
  let collection;
  if (isAddress(slug)) {
    collection = knownContracts.find((c) => c?.address.toLowerCase() === slug.toLowerCase());
  } else {
    collection = knownContracts.find((c) => c?.slug.toLowerCase() === slug.toLowerCase());
  }

  let nft;
  if (collection?.address) {
    nft = await store.dispatch(getNftDetails(collection.address, tokenId));
  }

  if (!collection || !nft) {
    return {
      notFound: true
    }
  }

  if (isAddress(slug)) {
    return {
      redirect: {
        destination: `/collection/${collection.slug}/${tokenId}`,
        permanent: false,
      },
      props: {
        slug: collection?.slug,
        id: tokenId,
        collection,
        nft,
      },
    };
  }

  return {
    props: {
      slug: collection?.slug,
      id: tokenId,
      collection,
      nft,
    },
  };
};

export default memo(Nft);
