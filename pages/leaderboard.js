import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { utils } from 'ethers';
import Card from '../src/Components/Leaderboard/Card';
import Table from '../src/Components/Leaderboard/Table';
import { getAllLeaderBoard } from '../src/GlobalState/leaderBoardSlice';
import { shortAddress } from '../src/utils';

const headers = {
  totalVolume: ['', 'Sales Volume', 'Buy Volume', 'Total Volume'],
  buyVolume: ['', '# of Buy', 'Total Volume'],
  sellVolume: ['', '# of Sales', 'Total Volume'],
  biggestSingleSale: ['', 'Transactions', 'Total Volume'],
};

export default function leaderboard() {
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

  return (
    <section className="container">
      <div className="d-flex align-items-center justify-content-between">
        <h2 className="mb-0">Cronos Marketplace NFT Sales</h2>
        <div className="col-md-4 col-lg-4 text-end">
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
            <li id="sale" className={timeframe === 'custom' ? 'active' : ''} onClick={() => updateTimeframe('custom')}>
              Competition
            </li>
          </ul>
        </div>
      </div>
      <div className="d-flex gap-3 mt-4 align-items-center justify-content-between">
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
      </div>
      <div className="mt-4">
        <Table headers={headers[type]} items={leaderBoard[type]} />
      </div>
    </section>
  );
}
