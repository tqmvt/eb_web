import React, { memo } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import Blockies from 'react-blockies';
import { faCheck, faCircle } from '@fortawesome/free-solid-svg-icons';

import LayeredIcon from './LayeredIcon';
import { getShortIdForView } from '../../utils';

const VerifiedIcon = styled.span`
  font-size: 8px;
  color: #ffffff;
  background: $color;
  border-radius: 100%;
  -moz-border-radius: 100%;
  -webkit-border-radius: 100%;
  position: absolute;
  bottom: 0px;
  right: 0px;
  z-index: 2;
`;

const ProfilePreview = ({
  type = '',
  title = '',
  to = '',
  address = '',
  avatar = '',
  verified = false,
  hover = '',
  pop = false,
}) => {
  const AvatarElement = (
    <>
      {(avatar || address) && (
        <div className="author_list_pp">
          <span>
            {avatar !== '' ? (
              <img className="lazy" src={avatar} alt={title} title={hover} />
            ) : address !== '' ? (
              <Blockies seed={address.toLowerCase()} size={10} scale={5} />
            ) : (
              <></>
            )}
            {verified && (
              <VerifiedIcon>
                <LayeredIcon icon={faCheck} bgIcon={faCircle} shrink={8} />
              </VerifiedIcon>
            )}
          </span>
        </div>
      )}
      <div className="author_list_info">
        <span>{title || getShortIdForView(address)}</span>
      </div>
    </>
  );

  const Hyperlink = ({ url }) => {
    if (url) {
      if (url.startsWith('http')) {
        return (
          <a href={url} target={pop ? '_blank' : '_self'} rel="noreferrer">
            {' '}
            {AvatarElement}{' '}
          </a>
        );
      } else {
        return (
          <Link href={url}>
            <a>{AvatarElement}</a>
          </Link>
        );
      }
    } else {
      return <div> {AvatarElement} </div>;
    }
  };

  return (
    <div className="col">
      <h6>{type}</h6>
      <div className="item_author">
        <Hyperlink url={to} />
      </div>
    </div>
  );
};

export default memo(ProfilePreview);
