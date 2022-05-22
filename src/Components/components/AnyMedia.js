import React, {memo, useEffect, useState} from 'react';
import ReactPlayer from "react-player";
import {fallbackImageUrl} from "../../core/constants";
import {Link, useHistory} from "react-router-dom";

export const AnyMedia = ({ image, video, title, url, newTab, usePlaceholder = true, videoProps, ...props }) => {
  const history = useHistory();
  const [dynamicType, setDynamicType] = useState(null);

  const mediaTypes = {
    image: 1,
    video: 2,
    audio: 3
  };

  useEffect(() => {
    determineMediaType();
  }, []);


  const navigateTo = (link) => {
    if (newTab) {
      window.open(link, '_blank');
    } else {
      history.push(link);
    }
  };

  const determineMediaType = () => {
    const xhr = new XMLHttpRequest();
    xhr.open('HEAD', image, true);

    xhr.onload = function() {
      const contentType = xhr.getResponseHeader('Content-Type');
      const mediaType = contentType.split('/')[0];
      setDynamicType(mediaTypes[mediaType] ?? mediaTypes.image);
    };

    xhr.send();
  }

  const Image = ({image, title, url}) => {
    return (
      <img
        src={image}
        alt={title}
        onError={({ currentTarget }) => {
          currentTarget.onerror = null;
          currentTarget.src = fallbackImageUrl;
        }}
        {...props}
      />
    )
  }

  const Video = ({video, image, title}) => {
    return (
      <ReactPlayer
        controls={true}
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
        playing={true}
        loop={true}
        light={usePlaceholder ? image : undefined}
        width="100%"
        height={videoProps?.height ?? '100%'}
      />
    );
  }

  return (
    <>
      {dynamicType && (
        <>
          {video || dynamicType === mediaTypes.video ? (
            <Video
              video={video ?? image}
              image={dynamicType !== mediaTypes.video ? image : null}
              title={title}
            />
          ) : (
            <Link to={url}>
              <Image
                image={image}
                title={title}
                url={url}
              />
            </Link>
          )}
        </>
      )}
    </>
  )
}

export default memo(AnyMedia);
