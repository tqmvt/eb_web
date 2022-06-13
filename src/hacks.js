import { caseInsensitiveCompare } from './utils';
import {appConfig, imageDomains} from './Config';

export function isCroSkullRedPotion(address) {
  return caseInsensitiveCompare(address, '0x508378E99F5527Acb6eB4f0fc22f954c5783e5F9');
}

export function croSkullRedPotionImage() {
  return 'https://cdn.ebisusbay.com/files/0x508378e99f5527acb6eb4f0fc22f954c5783e5f9/images/redpotion.gif';
}

export function specialImageTransform(address, defaultImage) {
  if (isCroSkullRedPotion(address)) {
    return croSkullRedPotionImage();
  }

  if (!defaultImage) {
    return hostedImage('/img/nft-placeholder.webp');
  }

  const imageUrl = new URL(defaultImage);
  //Replace VIP GIF with MP4 can remove when image kit transforms gif without file exension
  //Or when metadata updated for image ;)
  if(caseInsensitiveCompare(imageUrl.pathname, '/QmTeJ3UYT6BG8v4Scy9E3W9cxEq6TCeg5SiuLKNFXbsW87')){
    imageUrl.pathname = `QmX97CwY2NcmPmdS6XtcqLFMV2JGEjnEWjxBQbj4Q6NC2i`;
    return imageUrl.toString();
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
  const cdn = appConfig('urls.cdn');
  return `${cdn}${imgPath}`;
}

export const nftCardUrl = (nftAddress, nftImage) => {
  if(nftImage.startsWith('data')) return nftImage;
  const imageUrl = new URL(specialImageTransform(nftAddress, nftImage));
  if(!imageUrl.searchParams){
    imageUrl.searchParams = new URLSearchParams();
  }
  imageUrl.searchParams.delete('tr');
  imageUrl.searchParams.set('tr', 'n-ml_card');

  return imageUrl.toString();
}