import {caseInsensitiveCompare} from './utils';
import {imageDomains} from './Config';
import {hostedImage} from "./helpers/image";

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

  if (!defaultImage || defaultImage === '/img/nft-placeholder.webp') {
    return hostedImage('/img/nft-placeholder.webp');
  }

  const imageUrl = new URL(defaultImage);
  //Replace VIP GIF with MP4 can remove when image kit transforms gif without file exension
  //Or when metadata updated for image ;)
  if(caseInsensitiveCompare(imageUrl.pathname, '/QmTeJ3UYT6BG8v4Scy9E3W9cxEq6TCeg5SiuLKNFXbsW87')){
    imageUrl.pathname = `QmX97CwY2NcmPmdS6XtcqLFMV2JGEjnEWjxBQbj4Q6NC2i.mp4`;
    return imageUrl.toString();
  }
  if(caseInsensitiveCompare(imageUrl.pathname, '/QmX97CwY2NcmPmdS6XtcqLFMV2JGEjnEWjxBQbj4Q6NC2i')){
    imageUrl.pathname = `QmX97CwY2NcmPmdS6XtcqLFMV2JGEjnEWjxBQbj4Q6NC2i.mp4`;
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

