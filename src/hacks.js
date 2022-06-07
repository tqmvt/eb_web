import { caseInsensitiveCompare } from './utils';
import { imageDomains } from './Config';
import config from './Assets/networks/rpc_config.json';

export function isCroSkullRedPotion(address) {
  return caseInsensitiveCompare(address, '0x508378E99F5527Acb6eB4f0fc22f954c5783e5F9');
}

export function croSkullRedPotionImage() {
  return 'https://app.ebisusbay.com/files/0x508378e99f5527acb6eb4f0fc22f954c5783e5f9/images/redpotion.gif';
}

export function croSkullRedPotionImageHack(address, defaultImage) {
  if (isCroSkullRedPotion(address)) {
    return croSkullRedPotionImage();
  }

  if (!defaultImage) {
    return hostedImage('/img/nft-placeholder.webp');
  }

  const filteredDomains = imageDomains.filter((domain) => defaultImage.includes(domain));
  if (filteredDomains.length) {
    return defaultImage;
  }

  // if (defaultImage.includes('https://') || defaultImage.includes('http://')) {
  //   return `${cloudinaryUrl}${defaultImage}`;
  // }

  return defaultImage;
}

export const hostedImage = (imgPath) => {
  imgPath = imgPath ? imgPath.replace(/^\/+/g, '') : '';
  const cdn = config.cdn_base;
  return `${cdn}${imgPath}`;
}
