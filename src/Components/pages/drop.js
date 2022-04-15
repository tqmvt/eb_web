import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import config from '../../Assets/networks/rpc_config.json';
import { connectAccount } from '../../GlobalState/User';
import { fetchMemberInfo, fetchVipInfo } from '../../GlobalState/Memberships';
import { fetchCronieInfo } from '../../GlobalState/Cronies';
import {
  caseInsensitiveCompare,
  createSuccessfulTransactionToastContent,
  isCreaturesDrop,
  isCrognomesDrop,
  isFounderDrop,
  isFounderVipDrop,
  isMagBrewVikingsDrop,
  newlineText,
  percentage,
} from '../../utils';
import { dropState as statuses } from '../../core/api/enums';
import { EbisuDropAbi } from '../../Contracts/Abis';
import MultiDrop from './multiDrop';
import SingleDrop from './singleDrop';
import CronosverseDrop from './CronosverseDrop';

export const drops = config.drops;

const Drop = () => {
  const { slug } = useParams();

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
