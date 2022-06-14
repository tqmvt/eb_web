import {CNS} from "@cnsdomains/core";
import {ethers} from "ethers";
import {appConfig} from "../Config";

const readProvider = new ethers.providers.JsonRpcProvider(appConfig('rpc.read'));

export const getCnsNames = async (addresses) => {
  const cns = new CNS(appConfig('chain.id'), readProvider);
  return await Promise.all(addresses.map(async (address) => await cns.getName(address)));
};

export const getCnsName = async (address) => {
  if (!address) return '';

  return getCnsNames([address]);
};