import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { faLink, faEllipsisH, faExchangeAlt, faTag, faTimes, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import config from '../../Assets/networks/rpc_config.json';
import { croSkullRedPotionImageHack } from '../../hacks';
import ReactPlayer from 'react-player';
import { fallbackImageUrl } from '../../core/constants';
import PopupMen from './PopupMenu';

const MyNftCard = ({
  nft,
  canTransfer = false,
  canSell = false,
  isStaked = false,
  canCancel = false,
  canUpdate = false,
  onTransferButtonPressed,
  onSellButtonPressed,
  onCancelButtonPressed,
  onUpdateButtonPressed,
  newTab = false,
  imgClass = 'marketplace',
}) => {
  const history = useHistory();

  const navigateTo = (link) => {
    if (newTab) {
      window.open(link, '_blank');
    } else {
      history.push(link);
    }
  };

  const nftUrl = () => {
    return `/collection/${nft.address}/${nft.id}`;
  };

  const onCopyLinkButtonPressed = (url) => () => {
    navigator.clipboard.writeText(url);
    toast.success('Copied!');
  };

  const getOptions = () => {
    const options = [];

    if(canSell){
      options.push({ 
        icon: faTag, 
        label: 'Sell',
        handleClick: onSellButtonPressed
      });
    }
    if(canTransfer){
      options.push({ 
        icon: faExchangeAlt, 
        label: 'Transfer',
        handleClick: onTransferButtonPressed 
      });
    }
    if(canUpdate){
      options.push({ 
        icon: faPen, 
        label: 'Update',
        handleClick: onUpdateButtonPressed
      });
    }
    if(canCancel){
      options.push({ 
        icon: faTimes, 
        label: 'Cancel',
        handleClick: onCancelButtonPressed 
      });
    }

    options.push({ icon: faLink, 
      label: 'Copy link', 
      handleClick: onCopyLinkButtonPressed(new URL(nftUrl(), config.app_base)
    )});

    return options;

  }

  return (
    <div className="card eb-nft__card h-100 shadow">
      {nft.video ? (
        <ReactPlayer
          controls={true}
          url={nft.video}
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
          light={nft.image}
          width="100%"
          height="100%"
        />
      ) : (
        <img
          onClick={() => navigateTo(nftUrl())}
          src={croSkullRedPotionImageHack(nft.address, nft.image)}
          className="card-img-top marketplace"
          style={{ cursor: 'pointer' }}
          alt={nft.name}
          onError={({ currentTarget }) => {
            currentTarget.onerror = null;
            currentTarget.src = fallbackImageUrl;
          }}
        />
      )}
      {nft.rank && typeof nft.rank === 'number' && (
        <div className="badge bg-rarity text-wrap mt-1 mx-1">Rank: #{nft.rank}</div>
      )}
      <div className="card-body d-flex flex-column">
        <div className="card-title mt-auto">
          <span onClick={() => navigateTo(nftUrl())} style={{ cursor: 'pointer' }}>
            {nft.count && nft.count > 0 ? (
              <h4>
                {nft.name} (x{nft.count})
              </h4>
            ) : (
              <h4>{nft.name}</h4>
            )}
          </span>
        </div>
        <p className="card-text">
          {nft.listed && nft.price ? <>{ethers.utils.commify(nft.price)} CRO</> : <>&nbsp;</>}
        </p>
      </div>
      <div className="card-footer mynft-card-footer" >
        <div>
          {isStaked && (
            <span className="mx-1">
              <strong>STAKED</strong>
            </span>
          )}
        </div>
        <PopupMen icon={faEllipsisH} options={getOptions()}>
          <FontAwesomeIcon icon={faEllipsisH} style={{ cursor: 'pointer' }}/>
        </PopupMen>
      </div>
    </div>
  );
};

export default memo(MyNftCard);
