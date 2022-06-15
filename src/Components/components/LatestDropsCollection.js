import React, { memo } from 'react';
import Slider from 'react-slick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';

import { settings } from './constants';
import CustomSlide from './CustomSlide';
import {appConfig} from "../../Config";
const drops = appConfig('drops');

const LatestDropsCollection = () => {
  const PrevArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div className={className} style={style} onClick={onClick}>
        <FontAwesomeIcon icon={faChevronLeft} />
      </div>
    );
  };

  const NextArrow = (props) => {
    const { className, style, onClick } = props;
    return (
      <div className={className} style={style} onClick={onClick}>
        <FontAwesomeIcon icon={faChevronRight} />
      </div>
    );
  };

  return (
    <div className="nft">
      <Slider {...settings} prevArrow={<PrevArrow />} nextArrow={<NextArrow />}>
        {drops &&
          drops.map((drop, index) => (
            <CustomSlide
              key={index}
              index={index + 1}
              avatar="/img/collections/crosmonauts/avatar.png"
              banner="/img/collections/crosmonauts/card.png"
              title={drop.title}
              // subtitle={drop.subtitle}
              collectionId={drop.address}
              url={`/drops/${drop.slug}`}
            />
          ))}
      </Slider>
    </div>
  );
};

export default memo(LatestDropsCollection);
