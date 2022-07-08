import {CNS} from "@cnsdomains/core";
import {ethers} from "ethers";
import {appConfig} from "../Config";

const readProvider = new ethers.providers.JsonRpcProvider(appConfig('rpc.read'));

export const getCnsNames = async (addresses) => {
  const cns = new CNS(appConfig('chain.id'), readProvider);
  const names = [];
  await Promise.all(addresses.map(async (address) => names[address] = await cns.getName(address)));
  return names;
};

/**
 * Get a single or multiple CNS names
 *
 * @param address
 * @returns {Promise<string|Awaited<unknown>[]>}
 */
export const getCnsName = async (address) => {
  if (!address) return '';
  const cns = new CNS(appConfig('chain.id'), readProvider);
  return await cns.getName(address);
};