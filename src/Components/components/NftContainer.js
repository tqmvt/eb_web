import React, { memo, useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import styled from 'styled-components';

import { getTheme } from '../../Theme/theme';
import { AnyMedia } from './AnyMedia';

import Button from './Button';

const Watermarked = styled.div`
  position: relative;
  &:after {
    content: '';
    display: block;
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0px;
    left: 0px;
    background-image: url(${(props) => props.watermark});
    background-size: 60px 60px;
    background-position: 0px 0px;
    background-repeat: no-repeat;
    opacity: 0.3;
  }
`;

const MakeBuy = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const MakeOffer = styled.div`
  margin-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;

  .w-45 {
    width: 45%;
  }
`;

const NftContainer = ({ nft, price = 0, isPreview = false }) => {
  const user = useSelector((state) => state.user);
  const [nftData, setNftData] = useState({isLoading: true});

  const disabledClick = () =>{
    if(isPreview){
      return 'not-active';
    }
    else{
      return '';
    }
  };

  useEffect(()=>{
    if(nft){
      setNftData({
        ...nft,
        isLoading: false,
        collection: null
      });
    }
  }, [nft])

  return (
    <>
      {!nftData.isLoading && 
      <div className="card eb-nft__card h-100 shadow" style={{minWidth: 330, maxWidth: 440}}>
        <AnyMedia
          image={ nftData.image}
          className={`card-img-top marketplace`}
          title={nftData.name}
          url={null}
          newTab={true}
        />
        
        {nftData.rank ? (
          <div className="badge bg-rarity text-wrap mt-1 mx-1">Rank: #{nftData.rank}</div>
        ) : (
          <br/>
        )}
        <div className="card-body d-flex flex-column justify-content-between">
          {nftData.collection && (
              <a className={`${disabledClick()}`}>
                <h6
                  className="card-title mt-auto fw-normal"
                  style={{ fontSize: '12px', color: getTheme(user.theme).colors.textColor4 }}
                >
                  {collection.name}
                </h6>
              </a>
          )}
            <a className={`${disabledClick()}`}>
              <h6 className="card-title mt-auto">{nftData.name}</h6>
            </a>
          <MakeBuy>
            <div>{price} CRO</div>
          </MakeBuy>
          <MakeOffer>
              <a className={`${disabledClick()}`} >
                <Button type="legacy">Buy</Button>
              </a>
            <div>
              <Button className={`${disabledClick()}`} type="legacy-outlined" onClick={() => handleMakeOffer('Make')}>
                Offer
              </Button>
            </div>
          </MakeOffer>
        </div>
      </div>}
    </>
  );
};

export default memo(NftContainer);
