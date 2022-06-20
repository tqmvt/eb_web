import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import MultiDrop from '../../src/Components/Drop/multiDrop';
import SingleDrop from '../../src/Components/Drop/singleDrop';
import CronosverseDrop from '../../src/Components/Drop/CronosverseDrop';
import {caseInsensitiveCompare} from "../../src/utils";
import Head from "next/head";
import {appConfig} from "../../src/Config";

export const drops = appConfig('drops');

const Drop = ({ssrDrop}) => {
  const router = useRouter();
  const { slug } = router.query;

  const [isMultiDrop, setIsMultiDrop] = useState(false);
  const [isMultiPrice, setIsMultiPrice] = useState(false);
  // const [drop, setDrop] = useState(null);
  //
  // useEffect(() => {
  //   let drop = drops.find((c) => c.slug === slug);
  //   if (drop) {
  //     setDrop(drop);
  //     setIsMultiDrop(drop.multiMint);
  //     setIsMultiPrice(drop.multiPrice);
  //   }
  // }, [slug]);

  return (
    <>
      <Head>
        <title>{ssrDrop?.title || 'NFT'} | Ebisu's Bay Marketplace</title>
        <meta name="description" content={`${ssrDrop?.subtitle || 'NFT'} for Ebisu's Bay Marketplace`} />
        <meta name="title" content={`${ssrDrop?.title || 'NFT'} | Ebisu's Bay Marketplace`} />
        <meta property="og:type" content="website" key="og_type" />
        <meta property="og:title" content={`${ssrDrop?.title || 'NFT'} | Ebisu's Bay Marketplace`} key="title" />
        <meta property="og:url" content={`https://app.ebisusbay.com/drops/${ssrDrop?.slug}`} key="og_url" />
        <meta property="og:image" content={ssrDrop?.imgNft} key="image" />
        <meta property="og:description" content={ssrDrop?.subtitle} key="og_desc" />
        <meta property="og:site_name" content="Ebisu's Bay Marketplace" />
        <meta name="twitter:title" content={`${ssrDrop?.title || 'NFT'} | Ebisu's Bay Marketplace`} key="twitter_title" />
        <meta name="twitter:image" content={ssrDrop?.imgNft} key="twitter_image" />
        <meta name="twitter:card" content="summary_large_image" key="misc-card" />
        <meta name="twitter:site" content="Ebisu's Bay Marketplace" key="twitter_site" />
      </Head>
      {ssrDrop && (
        <>
          {isMultiDrop ? (
            <MultiDrop drop={ssrDrop} />
          ) : isMultiPrice ? (
            <CronosverseDrop drop={ssrDrop} />
          ) : (
            <SingleDrop drop={ssrDrop} />
          )}
        </>
      )}
    </>
  );
};

export const getServerSideProps = async ({ params }) => {
  const slug = params?.slug;
  const drop = drops.find((c) => caseInsensitiveCompare(c.slug, slug));

  return {
    props: {
      slug: drop?.slug,
      ssrDrop: drop,
    },
  };
};

export default Drop;
