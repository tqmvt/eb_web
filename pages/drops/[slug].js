import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import config from '../../src/Assets/networks/rpc_config.json';
import MultiDrop from '../../src/Components/Drop/multiDrop';
import SingleDrop from '../../src/Components/Drop/singleDrop';
import CronosverseDrop from '../../src/Components/Drop/CronosverseDrop';

export const drops = config.drops;

const Drop = () => {
  const router = useRouter();
  const { slug } = router.query;

  const [isMultiDrop, setIsMultiDrop] = useState(false);
  const [isMultiPrice, setIsMultiPrice] = useState(false);
  const [drop, setDrop] = useState(null);

  useEffect(() => {
    let drop = drops.find((c) => c.slug === slug);
    if (drop) {
      setDrop(drop);
      setIsMultiDrop(drop.multiMint);
      setIsMultiPrice(drop.multiPrice);
    }
  }, [slug]);

  return (
    <>
      {drop && (
        <>
          {isMultiDrop ? (
            <MultiDrop drop={drop} />
          ) : isMultiPrice ? (
            <CronosverseDrop drop={drop} />
          ) : (
            <SingleDrop drop={drop} />
          )}
        </>
      )}
    </>
  );
};
export default Drop;