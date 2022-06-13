import React, { memo, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { fallbackImageUrl } from '../../core/constants';
import Link from 'next/link';
import {CdnImage} from "./CdnImage";

export const AnyMedia = ({ image, video, title, url, newTab, usePlaceholder = true, videoProps, className, layout='responsive', width=1, height=1, sizes }) => {
  const [dynamicType, setDynamicType] = useState(null);
  const [transformedImage, setTransformedImage] = useState(image);
  const [videoThumbnail, setVideoThumbNail] = useState(image);

  const blurImageUrl = (img)  => {
    if(img.startsWith('data')) return img;
    const imageUrl = new URL(img);
    
    if(!imageUrl.searchParams){
      imageUrl.searchParams = new URLSearchParams();
    }
    // imageUrl.searchParams.delete('tr');
    if(imageUrl.searchParams.has('tr')){
      imageUrl.searchParams.set('tr', imageUrl.searchParams.get('tr') + ',bl-30,q-10');
    } else {
      imageUrl.searchParams.set('tr', `w-${width},h-${height},bl-30,q-10`)
    }
    // imageUrl.searchParams.set('tr', 'n-blur_ml_card');
  
    return imageUrl.toString();
  }


  const mediaTypes = {
    image: 1,
    video: 2,
    audio: 3,
  };

  useEffect(() => {
    determineMediaType();
  }, []);

  const determineMediaType = () => {

    //prefer mp4 over gif 
    //currently ImageKit will only convert gif to mp4 if url ends in .gif 
    //so no need to check HEAD (this should be fixed in future).
    const imageURL = new URL(image);
    if(imageURL.pathname && imageURL.pathname.endsWith('.gif')){
      imageURL.pathname = `${imageURL.pathname}/ik-gif-video.mp4`;
      setTransformedImage(imageURL.toString());
      setVideoThumbNail(null);
      setDynamicType(mediaTypes.video);
    } else {
      const xhr = new XMLHttpRequest();
      xhr.open('HEAD', transformedImage, true);
  
      xhr.onload = function () {
        const contentType = xhr.getResponseHeader('Content-Type');
        const mediaType = contentType.split('/')[0];
        const type = mediaTypes[mediaType] ?? mediaTypes.image;
        if(type === mediaTypes.video){
          setVideoThumbNail(`${transformedImage}/ik-gif-video.mp4`)
        }
        setDynamicType(type);
      };
  
      xhr.send();
    }

  };

  return (
    <>
      {dynamicType && (
        <>
          {video || dynamicType === mediaTypes.video ? (
            <Video
              video={video ?? transformedImage}
              image={videoThumbnail}
              light='true'
              title={title}
              usePlaceholder={usePlaceholder}
              height={videoProps?.height}
              autoPlay={videoProps?.autoPlay}
              controls={videoProps?.controls}
              className={className}
            />
          ) : url ? (
            <Link href={url} target={newTab ? '_blank' : '_self'}>
              <a>
                <Image image={transformedImage} title={title} className={className} blur={blurImageUrl(transformedImage)} sizes={sizes} layout={layout} width={width} height={height} />
              </a>
            </Link>
          ) : (
            <Image image={transformedImage} title={title} className={className} blur={blurImageUrl(transformedImage)} sizes={sizes} layout={layout} width={width} height={height}/>
          )}
        </>
      )}
    </>
  );
};

export default memo(AnyMedia);

const Image = memo(({ image, title, className, blur, sizes, layout, width, height}) => {
  return (
    <CdnImage
      src={image}
      alt={title}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null;
        currentTarget.src = fallbackImageUrl;
      }}
      className={className}
      placeholder={blur ? 'blur' : 'empty'}
      blurDataURL={blur}
      layout={layout}
      sizes={sizes}
      width={width}
      height={height}
      unoptimized='true'
      objectFit="contain"
    />
  );
});

const Video = memo(
  ({ video, image, title, usePlaceholder, height = '100%', autoPlay = false, controls = true, className }) => {
    return (
      <ReactPlayer
        controls={controls}
        url={video}
        config={{
          file: {
            attributes: {
              onContextMenu: (e) => e.preventDefault(),
              controlsList: 'nodownload',
            },
          },
        }}
        muted={true}
        playing={usePlaceholder && image ? true : autoPlay}
        loop={true}
        light={usePlaceholder ? image : undefined}
        width="100%"
        height={height}
        className={className}
        playsinline={true}
      />
    );
  }
);
