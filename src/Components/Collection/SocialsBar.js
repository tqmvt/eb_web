import React, { memo } from 'react';
import { faBook, faCopy, faGlobe } from '@fortawesome/free-solid-svg-icons';
import { faDiscord, faInstagram, faMedium, faTelegram, faTwitter } from '@fortawesome/free-brands-svg-icons';
import LayeredIcon from '../components/LayeredIcon';
import { toast } from 'react-toastify';

const SocialsBar = ({ collection }) => {
  const handleCopy = (code) => () => {
    navigator.clipboard.writeText(code);
    toast.success('Address Copied!');
  };

  return (
    <div className="mt-2">
      {collection && collection.metadata.website && (
        <a href={collection.metadata.website} target="_blank" rel="noreferrer" title="View Website">
          <LayeredIcon icon={faGlobe} />
        </a>
      )}
      {collection && collection.metadata.twitter && (
        <a href={collection.metadata.twitter} target="_blank" rel="noreferrer" title="View Twitter">
          <LayeredIcon icon={faTwitter} />
        </a>
      )}
      {collection && collection.metadata.discord && (
        <a href={collection.metadata.discord} target="_blank" rel="noreferrer" title="View Discord">
          <LayeredIcon icon={faDiscord} />
        </a>
      )}
      {collection && collection.metadata.telegram && (
        <a href={collection.metadata.telegram} target="_blank" rel="noreferrer" title="View Telegram">
          <LayeredIcon icon={faTelegram} />
        </a>
      )}
      {collection && collection.metadata.instagram && (
        <a href={collection.metadata.instagram} target="_blank" rel="noreferrer" title="View Telegram">
          <LayeredIcon icon={faInstagram} />
        </a>
      )}
      {collection && collection.metadata.medium && (
        <a href={collection.metadata.medium} target="_blank" rel="noreferrer" title="View Medium">
          <LayeredIcon icon={faMedium} />
        </a>
      )}
      {collection && collection.metadata.gitbook && (
        <a href={collection.metadata.gitbook} target="_blank" rel="noreferrer" title="View Gitbook">
          <LayeredIcon icon={faBook} />
        </a>
      )}
      <span onClick={handleCopy(collection?.address)} style={{ cursor: 'pointer' }} title="Copy Smart Contract Address">
        <LayeredIcon icon={faCopy} />
      </span>
    </div>
  );
};

export default memo(SocialsBar);
