import React, { memo } from 'react';
import { useHistory } from 'react-router-dom';
import { ethers } from 'ethers';
import { toast } from 'react-toastify';
import { faLink, faEllipsisH, faExchangeAlt, faTag, faTimes, faPen } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import config from '../../Assets/networks/rpc_config.json';
import PopupMen from './PopupMenu';
import AnyMedia from "./AnyMedia";

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
      <AnyMedia
        image={nft.image}
        video={nft.video}
        title={nft.name}
        url={nftUrl()}
        newTab={true}
        className="card-img-top marketplace"
      />
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
