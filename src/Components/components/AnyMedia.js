import React, { memo, useEffect, useState } from 'react';
import ReactPlayer from 'react-player/lazy';
import { fallbackImageUrl } from '../../core/constants';
import Link from 'next/link';
import { CdnImage } from './CdnImage';
import { ImageKitService } from '../../helpers/image';

export const AnyMedia = ({
  image,
  video,
  title,
  url,
  newTab,
  usePlaceholder = false,
  videoProps,
  className,
  layout = 'responsive',
  width = 1,
  height = 1,
  sizes,
}) => {
  const [dynamicType, setDynamicType] = useState(null);
  const [transformedImage, setTransformedImage] = useState(image);
  const [videoThumbnail, setVideoThumbNail] = useState(image);

  const blurImageUrl = (img) => {
    return ImageKitService.buildBlurUrl(img, { width: 30, height: 30 });
  };

  const makeThumb = (vid) => {
    return ImageKitService.thumbify(new URL(vid));
  };

  const mediaTypes = {
    image: 1,
    video: 2,
    audio: 3,
    iframe: 4,
  };

  useEffect(() => {
    determineMediaType();
  }, []);

  const determineMediaType = () => {
    if (!image || image.startsWith('data')) {
      setDynamicType(mediaTypes.image);
      return;
    }

    const knownImageTypes = ['.png', '.jpg', '.jpeg', 'webp'];

    try {
      const imageURL = new URL(image);
      //prefer mp4 over gif
      if (imageURL.pathname && imageURL.pathname.endsWith('.gif')) {
        setTransformedImage(ImageKitService.gifToMp4(imageURL).toString());
        setVideoThumbNail(null);
        setDynamicType(mediaTypes.video);
      } else if (imageURL.pathname && imageURL.pathname.endsWith('.html')) {
        setDynamicType(mediaTypes.iframe);
      } else if (imageURL.pathname && knownImageTypes.some((o) => imageURL.pathname.endsWith(o))) {
        setDynamicType(mediaTypes.image);
      } else {
        const xhr = new XMLHttpRequest();
        xhr.open('HEAD', transformedImage, true);

        xhr.onload = function () {
          const contentType = xhr.getResponseHeader('Content-Type');
          const [mediaType, format] = contentType.split('/');
          let type = mediaTypes[mediaType] ?? mediaTypes.image;
          if (type === mediaTypes.video) {
            setVideoThumbNail(makeThumb(transformedImage));
          }
          if (format === 'gif') {
            setTransformedImage(ImageKitService.gifToMp4(imageURL).toString());
            setVideoThumbNail(null);
            setDynamicType(mediaTypes.video);
          } else {
            setDynamicType(type);
          }
        };

        xhr.send();
      }
    } catch (e) {
      console.log('Unable to determine media type', e, image);
      setDynamicType(mediaTypes.image);
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
              title={title}
              usePlaceholder={usePlaceholder}
              height={videoProps?.height}
              autoPlay={videoProps?.autoPlay}
              controls={videoProps?.controls}
              className={className}
              fallbackComponent={
                <AnyMedia
                  image={transformedImage}
                  title={title}
                  url={url}
                  newTab={newTab}
                  usePlaceholder={usePlaceholder}
                  videoProps={videoProps}
                  className={className}
                  layout={layout}
                  width={width}
                  height={height}
                  sizes={sizes}
                />
              }
            />
          ) : dynamicType === mediaTypes.iframe ? (
            <IFrame url={image} />
          ) : url ? (
            <Link href={url} target={newTab ? '_blank' : '_self'}>
              <a>
                <Image
                  image={transformedImage}
                  title={title}
                  className={className}
                  blur={blurImageUrl(transformedImage)}
                  sizes={sizes}
                  layout={layout}
                  width={width}
                  height={height}
                />
              </a>
            </Link>
          ) : (
            <Image
              image={transformedImage}
              title={title}
              className={className}
              blur={blurImageUrl(transformedImage)}
              sizes={sizes}
              layout={layout}
              width={width}
              height={height}
            />
          )}
        </>
      )}
    </>
  );
};

export default memo(AnyMedia);

const Image = memo(({ image, title, className, blur, sizes, layout, width, height }) => {
  return (
    <CdnImage
      src={image ?? fallbackImageUrl}
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
      unoptimized="true"
      objectFit="contain"
    />
  );
});

const Video = memo(
  ({
    video,
    image,
    title,
    usePlaceholder,
    height = '100%',
    autoPlay = false,
    controls = true,
    className,
    fallbackComponent,
  }) => {
    const [failed, setFailed] = useState(false);

    return !failed ? (
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
        onError={(e) => {
          setFailed(true);
        }}
      />
    ) : (
      <>{fallbackComponent}</>
    );
  }
);

const IFrame = memo(({ url }) => {
  return <iframe src={url} width="100%" height="100%" />;
});
