import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGlobalStyle } from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import { ethers } from 'ethers';
import Blockies from 'react-blockies';
import { Form, Spinner } from 'react-bootstrap';

import Footer from '../src/Components/components/Footer';
import { getAllCollections } from '../src/GlobalState/collectionsSlice';
import { debounce, siPrefixedNumber } from '../src/utils';

const GlobalStyles = createGlobalStyle`
  .mobile-view-list-item {
    display: flex;
    justify-content: space-between;
    cursor: pointer;
    
    & > span:nth-child(2) {
      font-weight: 300;
    }
  }
  .jumbotron.tint{
    background-color: rgba(0,0,0,0.6);
    background-blend-mode: multiply;
  }
`;

const Collections = () => {
  const mobileListBreakpoint = 1000;

  const dispatch = useDispatch();

  const tableMobileView = typeof window !== 'undefined' && window.innerWidth > mobileListBreakpoint;

  // const [tableMobileView, setTableMobileView] = useState(window.innerWidth > mobileListBreakpoint);
  const [searchTerms, setSearchTerms] = useState(null);
  const [filteredCollections, setFilteredCollections] = useState([]);

  const isLoading = useSelector((state) => state.collections.loading);
  const collections = useSelector((state) => {
    return state.collections.collections;
  });
  const sort = useSelector((state) => {
    return state.collections.sort;
  });

  const [timeframe, setTimeframe] = useState(null);

  useEffect(() => {
    dispatch(getAllCollections());
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (searchTerms) {
      setFilteredCollections(collections.filter((c) => c.name.toLowerCase().includes(searchTerms.toLowerCase())));
    } else {
      setFilteredCollections(collections);
    }
    // eslint-disable-next-line
  }, [collections]);

  const sortCollections = (key, override) => {
    if (override) {
      dispatch(getAllCollections(override.key, override.direction));
      return;
    }

    if (['volume', 'sales'].includes(key)) {
      if (timeframe) {
        key = `${key}${timeframe}`;
      } else if (key === 'volume') key = 'totalVolume';
      else if (key === 'sales') key = 'numberOfSales';
    }
    let direction = 'asc';
    if (key === sort.key) {
      direction = sort.direction === 'asc' ? 'desc' : 'asc';
    }
    dispatch(getAllCollections(key, direction));
  };

  const updateTimeframe = (val) => {
    const prev = timeframe;
    setTimeframe(val);
    if (val !== prev) {
      const sortKey = val ? `volume${val}` : 'totalVolume';
      sortCollections(sortKey, {
        key: sortKey,
        direction: 'desc',
      });
    }
  };

  const handleSearch = debounce((event) => {
    const { value } = event.target;
    setFilteredCollections(
      collections.filter((c) => {
        return c.name.toLowerCase().includes(value.toLowerCase());
      })
    );
    setSearchTerms(value);
  }, 300);

  // collection helper pipes

  const collectionVolume = (collection) => {
    if (timeframe === null) return Math.round(collection.totalVolume);
    if (timeframe === '1d') return Math.round(collection.volume1d);
    if (timeframe === '7d') return Math.round(collection.volume7d);
    if (timeframe === '30d') return Math.round(collection.volume30d);
  };

  const collectionSales = (collection) => {
    if (timeframe === null) return Math.round(collection.numberOfSales);
    if (timeframe === '1d') return Math.round(collection.sales1d);
    if (timeframe === '7d') return Math.round(collection.sales7d);
    if (timeframe === '30d') return Math.round(collection.sales30d);
  };

  const collectionAveragePrices = (collection) => {
    if (timeframe === null) return ethers.utils.commify(Math.round(collection.averageSalePrice));
    if (timeframe === '1d')
      return collection.sales1d > 0 ? ethers.utils.commify(Math.round(collection.volume1d / collection.sales1d)) : 0;
    if (timeframe === '7d')
      return collection.sales7d > 0 ? ethers.utils.commify(Math.round(collection.volume7d / collection.sales7d)) : 0;
    if (timeframe === '30d')
      return collection.sales30d > 0 ? ethers.utils.commify(Math.round(collection.volume30d / collection.sales30d)) : 0;
  };

  const collectionFloorPriceValue = ({ floorPrice }) => ethers.utils.commify(Math.round(floorPrice));
  const collectionNumberActiveValue = ({ numberActive }) => numberActive;

  return (
    <div>
      <GlobalStyles />
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center">Collections</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container no-top">
        <div className="row mt-4">
          <div className="col-lg-4 col-md-6">
            <Form.Control type="text" placeholder="Search for Collection" onChange={handleSearch} />
          </div>
          <div className="col-md-6 col-lg-8 text-end">
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
            </ul>
          </div>
        </div>
        {isLoading && (
          <div className="row mt-4">
            <div className="col-lg-12 text-center">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          </div>
        )}
        <div className="row">
          <div className="col-lg-12">
            <table className="table de-table table-rank" data-mobile-responsive="true">
              <thead>
                <tr>
                  {tableMobileView && <th scope="col">#</th>}
                  <th scope="col" style={{ cursor: 'pointer' }} onClick={() => sortCollections('name')}>
                    Collection
                  </th>
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={() => sortCollections('volume')}>
                      Volume {timeframe !== null && <span className="badge bg-secondary">{timeframe}</span>}
                    </th>
                  )}
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={() => sortCollections('sales')}>
                      Sales {timeframe !== null && <span className="badge bg-secondary">{timeframe}</span>}
                    </th>
                  )}
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={() => sortCollections('floorPrice')}>
                      Floor Price
                    </th>
                  )}
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }}>
                      Avg Price {timeframe !== null && <span className="badge bg-secondary">{timeframe}</span>}
                    </th>
                  )}
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={() => sortCollections('numberActive')}>
                      Active
                    </th>
                  )}
                </tr>
                <tr />
              </thead>
              <tbody>
                {filteredCollections &&
                  filteredCollections.map((collection, index) => {
                    return (
                      <tr key={index}>
                        {tableMobileView && <td>{index + 1}</td>}
                        <th scope="row" className="row gap-4 border-bottom-0" style={{ paddingLeft: 0 }}>
                          <div className="col-12" style={{ paddingLeft: '75px' }}>
                            <div className="coll_list_pp" style={{ cursor: 'pointer' }}>
                              <Link href={`/collection/${collection.slug}`}>
                                <a>
                                  {collection.metadata?.avatar ? (
                                    <img
                                      src={collection.metadata.avatar}
                                      alt={collection?.name}
                                      width="50"
                                      height="50"
                                    />
                                  ) : (
                                    <Blockies seed={collection.collection.toLowerCase()} size={10} scale={5} />
                                  )}
                                </a>
                              </Link>
                            </div>
                            <span>
                              <Link href={`/collection/${collection.slug}`}>
                                <a>{collection?.name ?? 'Unknown'}</a>
                              </Link>
                            </span>
                          </div>

                          {!tableMobileView && (
                            <div className="col-12 row gap-1">
                              <div className="col-12 mobile-view-list-item">
                                <span>#</span>
                                <span className="text-end">{index + 1}</span>
                              </div>
                              <div className="col-12 mobile-view-list-item" onClick={() => sortCollections('volume')}>
                                <span>
                                  Volume {timeframe !== null && <span className="badge bg-secondary">{timeframe}</span>}
                                </span>
                                <span className="text-end">{siPrefixedNumber(collectionVolume(collection))} CRO</span>
                              </div>
                              <div className="col-12 mobile-view-list-item" onClick={() => sortCollections('sales')}>
                                <span>
                                  Sales {timeframe !== null && <span className="badge bg-secondary">{timeframe}</span>}
                                </span>
                                <span className="text-end">{siPrefixedNumber(collectionSales(collection))}</span>
                              </div>
                              <div
                                className="col-12 mobile-view-list-item"
                                onClick={() => sortCollections('floorPrice')}
                              >
                                <span>Floor Price</span>
                                <span className="text-end">
                                  {collection.numberActive > 0 ? `${collectionFloorPriceValue(collection)} CRO` : 'N/A'}
                                </span>
                              </div>
                              <div className="col-12 mobile-view-list-item">
                                <span>
                                  Avg Price{' '}
                                  {timeframe !== null && <span className="badge bg-secondary">{timeframe}</span>}
                                </span>
                                <span className="text-end">{collectionAveragePrices(collection)} CRO</span>
                              </div>
                              <div
                                className="col-12 mobile-view-list-item"
                                onClick={() => sortCollections('numberActive')}
                              >
                                <span>Active</span>
                                <span className="text-end">
                                  {siPrefixedNumber(collectionNumberActiveValue(collection))}
                                </span>
                              </div>
                            </div>
                          )}
                        </th>
                        {tableMobileView && <td>{siPrefixedNumber(collectionVolume(collection))} CRO</td>}
                        {tableMobileView && <td>{siPrefixedNumber(collectionSales(collection))}</td>}
                        {tableMobileView && (
                          <td>{collection.numberActive > 0 ? `${collectionFloorPriceValue(collection)} CRO` : '-'}</td>
                        )}
                        {tableMobileView && <td>{collectionAveragePrices(collection)} CRO</td>}
                        {tableMobileView && <td>{siPrefixedNumber(collectionNumberActiveValue(collection))}</td>}
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Collections;
