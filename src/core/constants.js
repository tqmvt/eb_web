import {ethers} from "ethers";

export const fallbackImageUrl = '/img/nft-placeholder.webp';
export const txExtras = {
  gasPrice: ethers.utils.parseUnits('5000', 'gwei')
}
