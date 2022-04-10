import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { createGlobalStyle } from 'styled-components';
import { Link } from 'react-router-dom';
import { ethers } from 'ethers';
import Blockies from 'react-blockies';
import { Form, Spinner, Button, ButtonGroup } from 'react-bootstrap';
import { siPrefixedNumber } from '../../utils';
// import Select from 'react-select';

import Footer from '../components/Footer';
import { getAllCollections } from '../../GlobalState/collectionsSlice';
// import { searchListings } from '../../GlobalState/collectionSlice';
// import { SortOption } from '../Models/sort-option.model';
import { debounce } from '../../utils';

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

/* const customStyles = {
  option: (base, state) => ({
    ...base,
    background: '#fff',
    color: '#333',
    borderRadius: state.isFocused ? '0' : 0,
    '&:hover': {
      background: '#eee',
    },
  }),
  menu: (base) => ({
    ...base,
    borderRadius: 0,
    marginTop: 0,
  }),
  menuList: (base) => ({
    ...base,
    padding: 0,
  }),
  control: (base, state) => ({
    ...base,
    padding: 2,
  }),
}; */

const Collections = () => {
  const mobileListBreakpoint = 1000;

  const dispatch = useDispatch();

  const [tableMobileView, setTableMobileView] = useState(window.innerWidth > mobileListBreakpoint);
  const [searchTerms, setSearchTerms] = useState(null);
  const [filteredCollections, setFilteredCollections] = useState([]);

  const isLoading = useSelector((state) => state.collections.loading);
  const collections = useSelector((state) => {
    return state.collections.collections;
  });
  const sort = useSelector((state) => {
    return state.collections.sort;
  });

  const [timeframe, setTimeframe] = useState("");

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
  }, [collections]);

  const sortCollections = (key, type=null) => () => {
    if (key == "")  {
      if (type == "volume") key = "totalVolume"
      if (type == "sales") key = "numberOfSales"
    }
    let direction = 'asc';
    if (key === sort.key) {
      direction = sort.direction === 'asc' ? 'desc' : 'asc';
    }
    dispatch(getAllCollections(key, direction));
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

  //  collection helper pipes

  const collectionVolume = (collection) => {
    if (timeframe == "") return Math.round(collection.totalVolume)
    if (timeframe == "1d") return Math.round(collection.volume1d) 
    if (timeframe == "7d") return Math.round(collection.volume7d) 
    if (timeframe == "30d") return Math.round(collection.volume30d)
  }

  const collectionSales = (collection) => {
    if (timeframe == "") return Math.round(collection.numberOfSales);
    if (timeframe == "1d") return Math.round(collection.sales1d);
    if (timeframe == "7d") return Math.round(collection.sales7d);
    if (timeframe == "30d") return Math.round(collection.sales30d);
  }

  const collectionAveragePrices = (collection) => {
    if (timeframe == "") return ethers.utils.commify(Math.round(collection.averageSalePrice));
    if (timeframe == "1d") {
      if (collection.sales1d == 0) {
        return `0 CRO`
      }
      return ethers.utils.commify(Math.round(collection.volume1d / collection.sales1d).toString())
    }
    if (timeframe == "7d") {
      if (collection.sales7d == 0) {
        return `0 CRO`
      }
      return ethers.utils.commify(Math.round(collection.volume7d / collection.sales7d).toString())
    }
    if (timeframe == "30d") {
      if (collection.sales30d == 0) {
          return `0 CRO`
      }
        return ethers.utils.commify(Math.round(collection.volume30d / collection.sales30d).toString())
      }  
    }

  const collectionFloorPriceValue = ({ floorPrice }) => ethers.utils.commify(Math.round(floorPrice)) + " CRO"
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
        <div class="btn-group" role="group" aria-label="Basic example">
          <button type="button" class="btn-primary" onClick={() => setTimeframe("")}>All Time</button>
          <button type="button" class="btn-primary" onClick={() => setTimeframe("1d")}>1d</button>
          <button type="button" class="btn-primary" onClick={() => setTimeframe("7d")}>7d</button>
          <button type="button" class="btn-primary" onClick={() => setTimeframe("30d")}>30d</button>
        </div>
        <div className="row">
          <div className="col-lg-12">
            <table className="table de-table table-rank" data-mobile-responsive="true">
              <thead>
                <tr>
                  {tableMobileView && <th scope="col">#</th>}
                  <th scope="col" style={{ cursor: 'pointer' }} onClick={sortCollections('name')}>
                    Collection
                  </th>
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={sortCollections(timeframe, "volume")}>
                      Volume {timeframe != "" && (
                        "(" + timeframe + ")"
                      )}
                    </th>
                  )}
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={sortCollections(timeframe, "sales")}>
                      Sales {timeframe != "" && (
                        "(" + timeframe + ")"
                      )}
                    </th>
                  )}
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }}>
                      Avg. Sale Price {timeframe != "" && (
                        "(" + timeframe + ")"
                      )}
                    </th>
                  )}
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={sortCollections('floorPrice')}>
                      Floor Price
                    </th>
                  )}
                  {tableMobileView && (
                    <th scope="col" style={{ cursor: 'pointer' }} onClick={sortCollections('numberActive')}>
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
                        <th scope="row" className="row gap-4 border-bottom-0">
                          <div className="col-12">
                            <div className="coll_list_pp" style={{ cursor: 'pointer' }}>
                              <Link to={`/collection/${collection.slug}`}>
                                {collection.metadata?.avatar ? (
                                  <img className="lazy" src={collection.metadata.avatar} alt={collection?.name} />
                                ) : (
                                  <Blockies seed={collection.collection.toLowerCase()} size={10} scale={5} />
                                )}
                              </Link>
                            </div>
                            <span>
                              <Link to={`/collection/${collection.slug}`}>{collection?.name ?? 'Unknown'}</Link>
                            </span>
                          </div>

                          {!tableMobileView && (
                            <div className="col-12 row gap-1">
                              <div className="col-12 mobile-view-list-item">
                                <span>#</span>
                                <span>{index + 1}</span>
                              </div>
                              <div className="col-12 mobile-view-list-item" onClick={sortCollections(timeframe, "volume")}>
                                <span>Volume {timeframe != "" && (
                                    "(" + timeframe + ")"
                                )}</span>
                                <span>{siPrefixedNumber(collectionVolume(collection))} CRO</span>
                              </div>
                              <div className="col-12 mobile-view-list-item" onClick={sortCollections(timeframe, "sales")}>
                              <span>Sales {timeframe != "" && (
                                    "(" + timeframe + ")"
                                )}</span>
                                <span>{siPrefixedNumber(collectionSales(collection))}</span>
                              </div>
                              <div className="col-12 mobile-view-list-item">
                              <span>Avg. Sale Price {timeframe != "" && (
                                    "(" + timeframe + ")"
                                )}</span>
                                <span>{collectionAveragePrices(collection)} CRO</span>
                              </div>
                              <div className="col-12 mobile-view-list-item" onClick={sortCollections('floorPrice')}>
                                <span>Floor Price</span>
                                <span>{collectionFloorPriceValue(collection)}</span>
                              </div>
                              <div className="col-12 mobile-view-list-item" onClick={sortCollections('numberActive')}>
                                <span>Active</span>
                                <span>{siPrefixedNumber(collectionNumberActiveValue(collection))}</span>
                              </div>
                            </div>
                          )}
                        </th>
                        {tableMobileView && <td>{siPrefixedNumber(collectionVolume(collection))}</td>}
                        {tableMobileView && <td>{siPrefixedNumber(collectionSales(collection))}</td>}
                        {tableMobileView && <td>{collectionAveragePrices(collection)} CRO</td>}
                        {tableMobileView && <td>{collectionFloorPriceValue(collection)}</td>}
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
