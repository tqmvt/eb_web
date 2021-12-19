import React, { memo } from "react";
import { useDispatch } from 'react-redux';
import Slider from "react-slick";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { settings } from "./constants";
import CustomSlide from "./CustomSlide";
import config from "../../Assets/networks/rpc_config.json";
export const drops = config.drops;

const LatestDropsCollection = () => {

  return (
      <div className='nft'>
        <Slider {...settings}>
          { drops && drops.map((drop, index) => (
            <CustomSlide
              key={index}
              index={index + 1}
              avatar={drop.imgPreview}
              banner={drop.imgNft}
              title={drop.title}
              subtitle={drop.subtitle}
              collectionId={drop.address}
              url={`/drops/${drop.slug}`}
            />
          ))}
        </Slider>
      </div>
  );
}

export default memo(LatestDropsCollection);
