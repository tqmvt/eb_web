import {CNS} from "@cnsdomains/core";
import config from "../Assets/networks/rpc_config.json";
import {ethers} from "ethers";

const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);

export const getCnsNames = async (addresses) => {
  const cns = new CNS(config.chain_id, readProvider);
  return await Promise.all(addresses.map(async (address) => await cns.getName(address)));
};

export const getCnsName = async (address) => {
  if (!address) return '';

  return getCnsNames([address]);
};