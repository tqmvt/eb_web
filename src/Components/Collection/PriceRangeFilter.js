import React, { memo, useEffect, useState } from 'react';
import { Accordion, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

import {filterListingsByPrice, filterListingsByTrait} from '../../GlobalState/collectionSlice';
import { humanize } from '../../utils';
import './Filters.css';
import Button from "../components/Button";

const PriceRangeFilter = ({ address, ...props }) => {
  const dispatch = useDispatch();

  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);

  const clearAttributeFilters = () => {
    setMinPrice(null);
    setMaxPrice(null);
    // filterListingsByPrice({
    //   null,
    //   null,
    //   address,
    // })
  };

  const onApply = () => {
    console.log('clicked a thing...');
    // filterListingsByPrice({
    //   minPrice,
    //   maxPrice,
    //   address,
    // })
  };

  return (
    <div {...props}>

      {(minPrice > 0 || maxPrice > 0) && (
        <div className="d-flex justify-content-between align-middle">
          <span>{minPrice} - {maxPrice} CRO</span>
          <div
            className="d-inline-block fst-italic my-auto"
            style={{ fontSize: '0.8em', cursor: 'pointer' }}
            onClick={clearAttributeFilters}
          >
            Clear
          </div>
        </div>
      )}

      <Accordion>
        <Accordion.Item eventKey="price">
          <Accordion.Header><h3 className="my-1">Price Range</h3></Accordion.Header>
          <Accordion.Body>
            <div className="row">
              <div className="col-xl-6 col-lg-12 px-2 mt-2">
                <Form.Control
                  type="text"
                  placeholder="Min Price"
                  onChange={e => setMinPrice(e.target.value)}
                  style={{ marginBottom: 0, marginTop: 0 }}
                />
              </div>
              <div className="col-xl-6 col-lg-12 px-2 mt-2">
                <Form.Control
                  type="text"
                  placeholder="Max Price"
                  onChange={e => setMaxPrice(e.target.value)}
                  style={{ marginBottom: 0, marginTop: 0 }}
                />
              </div>
            </div>
            <div className="row">
              <div className="col">
                <Button type="legacy" className="ms-auto mt-3" onClick={onApply}>
                  Apply
                </Button>
              </div>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </div>
  );
};

export default memo(PriceRangeFilter);
