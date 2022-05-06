import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import config from '../../Assets/networks/rpc_config.json';
import MultiDrop from './multiDrop';
import SingleDrop from './singleDrop';
import CronosverseDrop from './CronosverseDrop';

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
