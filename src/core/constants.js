import {ethers} from "ethers";
import {hostedImage} from "../hacks";

export const fallbackImageUrl = hostedImage('/img/nft-placeholder.webp');
export const txExtras = {
  gasPrice: ethers.utils.parseUnits('5000', 'gwei')
}
