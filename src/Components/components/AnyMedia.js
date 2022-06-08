import React, { memo, useEffect, useState } from 'react';
import ReactPlayer from 'react-player';
import { fallbackImageUrl } from '../../core/constants';
import Link from 'next/link';
import {CdnImage} from "./CdnImage";

export const AnyMedia = ({ image, video, title, url, newTab, usePlaceholder = true, videoProps, className }) => {
  const [dynamicType, setDynamicType] = useState(null);

  const mediaTypes = {
    image: 1,
    video: 2,
    audio: 3,
  };

  useEffect(() => {
    determineMediaType();
  }, []);

  const determineMediaType = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', image, true);

    xhr.onload = function () {
      const contentType = xhr.getResponseHeader('Content-Type');
      const mediaType = contentType.split('/')[0];
      setDynamicType(mediaTypes[mediaType] ?? mediaTypes.image);
    };

    xhr.send();
  };

  return (
    <>
      {dynamicType && (
        <>
          {video || dynamicType === mediaTypes.video ? (
            <Video
              video={video ?? image}
              image={dynamicType !== mediaTypes.video ? image : null}
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
                <Image image={image} title={title} className={className} />
              </a>
            </Link>
          ) : (
            <Image image={image} title={title} className={className} />
          )}
        </>
      )}
    </>
  );
};

export default memo(AnyMedia);

const Image = memo(({ image, title, className }) => {
  return (
    <CdnImage
      src={image}
      alt={title}
      width={384}
      height={384}
      onError={({ currentTarget }) => {
        currentTarget.onerror = null;
        currentTarget.src = fallbackImageUrl;
      }}
      className={className}
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
