import {appConfig} from "../../Config";
import Image from "next/image";

export const imageKitLoader = ({ src, width, quality }) => {
  if(src[0] === "/") src = src.slice(1);
  const params = [`w-${width}`];
  if (quality) {
    params.push(`q-${quality}`);
  }
  params.push('pr-true')
  const paramsString = params.join(",");
  var urlEndpoint = appConfig('urls.cdn');
  if (src.includes(urlEndpoint)) {
    return `${src}?tr=${paramsString}`
  }
  if(urlEndpoint[urlEndpoint.length-1] === "/") urlEndpoint = urlEndpoint.substring(0, urlEndpoint.length - 1);
  return `${urlEndpoint}/${src}?tr=${paramsString}`
}

export const CdnImage = ({...props}) => {
  return (
    <Image
      loader={imageKitLoader}
      {...props}
    />
  );
};