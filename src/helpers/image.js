import {appConfig, isLocalEnv} from "../Config";
import {specialImageTransform} from "../hacks";

export class ImageKitService {
  imageUrl = '';
  trValues = {};

  constructor(imageUrl) {
    this.imageUrl = imageUrl;
  }

  static from(imageUrl) {
    return new ImageKitService(imageUrl);
  }

  static buildBlurUrl(imageUrl, {width, height}) {
    const kit = ImageKitService.from(imageUrl)
      .setBlur(30)
      .setQuality(10);

    if (width) kit.setWidth(width);
    if (height) kit.setHeight(height);

    return kit.buildUrl();
  }

  static thumbify(url) {
    if(url.pathname.includes('.')){
      //try to use imagekit thumbnail (check for period it doesn't work if no exension)
      url.pathname = url.pathname = '/ik-thumbnail.jpg'
      return url.toString();
    }
  }

  static gifToMp4(url) {
    url.pathname = `${url.pathname}/ik-gif-video.mp4`;
    return url.toString();
  }

  static buildNftCardUrl(imageUrl) {
    const kit = ImageKitService.from(imageUrl).setNamed('ml_card');
    return kit.buildUrl();
  }

  static buildAvatarUrl(imageUrl) {
    const kit = ImageKitService.from(imageUrl).setNamed('avatar');
    return kit.buildUrl();
  }

  static buildBannerUrl(imageUrl) {
    const kit = ImageKitService.from(imageUrl)
      .setWidth(1920)
      .setHeight(1080)
      .setCrop('at_max');

    return kit.buildUrl();
  }

  // setAsCard() {
  //   this.setParam('n', 'n-ml_card');
  //   return this;
  // }
  //
  // setAsThumbnail() {
  //   this.setParam('n', 'n-avatar');
  //   return this;
  // }

  setWidth(value) {
    this.setParam('w', value);
    return this;
  }

  setHeight(value) {
    this.setParam('h', value);
    return this;
  }

  setBlur(value) {
    this.setParam('bl', value);
    return this;
  }

  setQuality(value) {
    this.setParam('q', value);
    return this;
  }

  setCrop(value) {
    this.setParam('c', value);
    return this;
  }

  setNamed(value) {
    this.setParam('n', value);
    return this;
  }

  setParam(key, value) {
    this.trValues[key] = value;
    return this;
  }

  buildUrl() {
    if (isLocalEnv()) return this.imageUrl;
    if(!this.imageUrl || this.imageUrl.startsWith('data')) return this.imageUrl;

    const cdn = appConfig('urls.cdn');
    const url = new URL(this.imageUrl, !this.imageUrl.includes(cdn) ? cdn : undefined);
    if(!url.searchParams){
      url.searchParams = new URLSearchParams();
    }

    if (Object.entries(this.trValues).length > 0) {
      const mapped = Object.entries(this.trValues).map(([k,v]) => `${k}-${v}`);
      url.searchParams.set('tr', mapped.join());
    }

    return url.toString();
  }
}

/**
 * Build a hosted image URL from our CDN
 *
 * @param imgPath
 * @param useThumbnail
 * @returns {string}
 */
export const hostedImage = (imgPath, useThumbnail) => {
  if (isLocalEnv()) return imgPath;
  if (!imgPath) return imgPath;

  imgPath = imgPath.replace(/^\/+/g, '');
  const cdn = appConfig('urls.cdn');

  const imageUrl = new URL(imgPath, cdn);

  if (useThumbnail) {
    return ImageKitService.buildAvatarUrl(imageUrl.toString());
  }
  return ImageKitService.from(imageUrl.toString()).buildUrl();
}
/**
 * Build a hosted image URL from our CDN that is fit for the NFT cards
 *
 * @param nftAddress
 * @param nftImage
 * @returns {string|*}
 */
export const nftCardUrl = (nftAddress, nftImage) => {
  if (!nftImage || nftImage.startsWith('data')) return nftImage;
  return ImageKitService.buildNftCardUrl(specialImageTransform(nftAddress, nftImage));
}