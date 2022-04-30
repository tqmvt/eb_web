import React, { memo, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Slider from 'react-slick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

import { settings } from './constants';
import CustomSlide from './CustomSlide';
import { getAllCollections } from '../../GlobalState/collectionsSlice';

const HotCollections = () => {
  const dispatch = useDispatch();

  const hotCollections = useSelector((state) => {
    return state.collections.collections
      .slice()
      .sort((a, b) => {
        const aVal = parseInt(a.volume7d)// * parseInt(a.sales1d);
        const bVal = parseInt(b.volume7d)// * parseInt(b.sales1d);
        return aVal < bVal ? 1 : -1;
      })
      .slice(0, 10);
  });

  useEffect(() => {
    dispatch(getAllCollections());
  }, [dispatch]);

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
        {hotCollections &&
          hotCollections.map((item, index) => (
            <CustomSlide
              key={index}
              index={index + 1}
              avatar={item.metadata.avatar}
              banner={item.metadata.card}
              title={item.name}
              collectionId={item.address}
              url={`/collection/${item.slug}`}
              verified={item.metadata.verified}
            />
          ))}
      </Slider>
    </div>
  );
};

export default memo(HotCollections);
