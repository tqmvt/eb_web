import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { utils } from 'ethers';
import Card from '../src/Components/Leaderboard/Card';
import Table from '../src/Components/Leaderboard/Table';
import { getAllLeaderBoard } from '../src/GlobalState/leaderBoardSlice';
import { shortAddress } from '../src/utils';
import Slider from 'react-slick';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import styles from '../src/Components/Leaderboard/styles.module.scss';

export const carouselSettings = {
  infinite: true,
  slidesToShow: 4,
  slidesToScroll: 4,
  initialSlide: 0,
  adaptiveHeight: 300,
  lazyLoad: true,
  arrows: false,
  responsive: [
    {
      breakpoint: 1900,
      settings: {
        slidesToShow: 4,
        slidesToScroll: 4,
      },
    },
    {
      breakpoint: 1600,
      settings: {
        slidesToShow: 3,
        slidesToScroll: 1,
        centerMode: true,
        focusOnSelect: true,
        dots: true,
      },
    },
    {
      breakpoint: 1024,
      settings: {
        slidesToShow: 2,
        slidesToScroll: 2,
        focusOnSelect: true,
        dots: true,
      },
    },
    {
      breakpoint: 600,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        focusOnSelect: true,
        dots: true,
        arrows: true,
      },
    },
    {
      breakpoint: 480,
      settings: {
        slidesToShow: 1,
        slidesToScroll: 1,
        focusOnSelect: true,
        dots: true,
        arrows: true,
      },
    },
  ],
};

const headers = {
  totalVolume: ['User', 'Sales Volume', 'Buy Volume', 'Total Volume'],
  buyVolume: ['User', '# of Buys', 'Total Volume'],
  sellVolume: ['User', '# of Sales', 'Total Volume'],
  biggestSingleSale: ['User', 'Total Volume'],
};

export default function Stats() {
  const [timeframe, setTimeframe] = useState(null);
  const [type, setType] = useState('totalVolume');
  const dispatch = useDispatch();

  const leaderBoard = useSelector((state) => {
    return state.leaderBoard;
  });

  const updateTimeframe = (val) => {
    setTimeframe(val);
  };

  useEffect(() => {
    dispatch(getAllLeaderBoard(timeframe));
  }, [timeframe]);

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
    <section className="container">
      <div className="row">
        <div className="col-12 col-lg-7 text-center text-lg-start">
          <h2 className="mb-0">Cronos Marketplace NFT Sales</h2>
        </div>
        <div className="col-12 col-lg-5 text-center text-lg-end mt-4 mt-lg-0">
          <ul className="activity-filter">
            <li id="sale" className={timeframe === '1d' ? 'active' : ''} onClick={() => updateTimeframe('1d')}>
              1d
            </li>
            <li id="sale" className={timeframe === '7d' ? 'active' : ''} onClick={() => updateTimeframe('7d')}>
              7d
            </li>
            <li id="sale" className={timeframe === '30d' ? 'active' : ''} onClick={() => updateTimeframe('30d')}>
              30d
            </li>
            <li id="sale" className={timeframe === null ? 'active' : ''} onClick={() => updateTimeframe(null)}>
              All Time
            </li>
            {/*<li id="sale" className={timeframe === 'custom' ? 'active' : ''} onClick={() => updateTimeframe('custom')}>*/}
            {/*  Competition*/}
            {/*</li>*/}
          </ul>
        </div>
      </div>
      <div className="d-flex gap-3 mt-lg-4 align-items-center justify-content-between">
        <div className={`nft ${styles.dots}`}>
          <Slider {...carouselSettings} prevArrow={<PrevArrow />} nextArrow={<NextArrow />}>
            <Card
              title="Most Total Volume"
              onClick={() => setType('totalVolume')}
              totalVolume={utils.commify(leaderBoard?.totalVolume[0]?.totalVolume || 0)}
              name={shortAddress(leaderBoard?.totalVolume[0]?.address) || 0}
              active={type === 'totalVolume'}
            />
            <Card
              title="Most Buy Volume"
              onClick={() => setType('buyVolume')}
              totalVolume={utils.commify(leaderBoard?.buyVolume[0]?.totalVolume || 0)}
              name={shortAddress(leaderBoard?.sellVolume[0]?.address) || 0}
              active={type === 'buyVolume'}
            />
            <Card
              title="Most Sell Volume"
              onClick={() => setType('sellVolume')}
              totalVolume={utils.commify(leaderBoard?.sellVolume[0]?.totalVolume || 0)}
              name={shortAddress(leaderBoard?.sellVolume[0]?.address) || 0}
              active={type === 'sellVolume'}
            />
            <Card
              title="Biggest Single Sale"
              onClick={() => setType('biggestSingleSale')}
              totalVolume={utils.commify(leaderBoard?.biggestSingleSale[0]?.totalVolume || 0)}
              name={shortAddress(leaderBoard?.biggestSingleSale[0]?.address) || 0}
              active={type === 'biggestSingleSale'}
            />
          </Slider>
        </div>
      </div>
      <div className="mt-4 table-responsive">
        <Table headers={headers[type]} items={leaderBoard[type]} />
      </div>
    </section>
  );
}
