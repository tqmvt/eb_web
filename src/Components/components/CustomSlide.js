import React, { memo } from 'react';
import Blockies from 'react-blockies';
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';
import styled from 'styled-components';

import LayeredIcon from './LayeredIcon';
import {hostedImage} from "../../helpers/image";

const VerifiedIcon = styled.span`
  font-size: 10px;
  color: #ffffff;
  background: $color;
  border-radius: 100%;
  -moz-border-radius: 100%;
  -webkit-border-radius: 100%;
  position: absolute;
  bottom: 2px;
  right: 2px;
`;

const CustomSlide = ({ index, avatar, banner, title, subtitle, collectionId, url, verified, externalPage = false }) => {
  const navigateTo = (url) => {
    if (url && typeof window !== 'undefined') {
      window.open(url, externalPage ? '_blank' : '_self');
    }
  };

  return (
    <div className="itm" key={index}>
      <div className="nft_coll cursor-pointer" onClick={() => navigateTo(url)}>
        <div className="nft_wrap">
          <span>
            <img src={hostedImage(banner)} className="lazy img-fluid" alt={title} />
          </span>
        </div>
        <div className="nft_coll_pp">
          <span>
            {avatar ? (
              <img className="lazy" src={hostedImage(avatar, true)} alt={title} />
            ) : (
              <Blockies seed={collectionId} size={10} scale={6} />
            )}
            {verified && (
              <VerifiedIcon>
                <LayeredIcon icon={faCheck} bgIcon={faCircle} shrink={7} />
              </VerifiedIcon>
            )}
          </span>
        </div>
        <div className="nft_coll_info">
          <span>
            <h4>{title}</h4>
          </span>
          <span>{subtitle}</span>
        </div>
      </div>
    </div>
  );
};

export default memo(CustomSlide);
