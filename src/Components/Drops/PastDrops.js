import React, {memo, useEffect, useState} from "react";
import { useDispatch } from 'react-redux';
import Slider from "react-slick";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import { settings } from "../components/constants";
import CustomSlide from "../components/CustomSlide";
import config from '../../Assets/networks/rpc_config.json'
import { faArrowLeft, faChevronLeft, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import {caseInsensitiveCompare} from "../../utils";
export const drops = config.drops;
export const collections = config.known_contracts;

const PastDrops = () => {

  const dispatch = useDispatch();

  const [pastDrops, setPastDrops] = useState([]);

  function arrangeCollections() {
      const completedDrops = drops.filter(d => d.complete && d.published);
      const dropCollections = completedDrops.map(d => {
          const collection = collections.find(c => c.address && caseInsensitiveCompare(c.address, d.address));

          return {collection, drop: d};
      })
      setPastDrops(dropCollections.filter(d => d.collection));
  }

  useEffect(() => {
      arrangeCollections();
  }, [dispatch]);

    const PrevArrow = (props) => {
        const { className, style, onClick } = props;
        return (
            <div className={className} style={style} onClick={onClick} >
                <FontAwesomeIcon icon={faChevronLeft}/>
            </div>
        );
    }

    const NextArrow = (props) => {
        const { className, style, onClick } = props;
        return (
            <div className={className} style={style} onClick={onClick} >
                <FontAwesomeIcon icon={faChevronRight}/>
            </div>
        );
    }

  return (
      <div className='nft'>

          <Slider {...settings}
            prevArrow={<PrevArrow />}
            nextArrow={<NextArrow />}
          >

          { pastDrops && pastDrops.map((item, index) => (
            <CustomSlide
              key={index}
              index={index + 1}
              avatar={item.drop.imgAvatar}
              banner={item.collection.metadata.card}
              title={item.drop.title}
              collectionId={item.drop.slug}
              verified={true}
            />
          ))}
        </Slider>
      </div>
  );
}

export default memo(PastDrops);
