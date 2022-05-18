import React, { memo, useState } from 'react';
import { Accordion, Form } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import {filterListingsByPrice} from '../../GlobalState/collectionSlice';
import './Filters.css';
import Button from "../components/Button";
import {commify} from "ethers/lib/utils";

const PriceRangeFilter = ({ address, ...props }) => {
  const dispatch = useDispatch();

  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const cachedMinPriceFilter = useSelector((state) => state.collection.cachedMinPrice[address]);
  const cachedMaxPriceFilter = useSelector((state) => state.collection.cachedMaxPrice[address]);

  const clearAttributeFilters = () => {
    setMinPrice('');
    setMaxPrice('');

    dispatch(
      filterListingsByPrice({
        address,
        minPrice: null,
        maxPrice: null
      })
    );
  };

  const onApply = () => {
    dispatch(
      filterListingsByPrice({
        address,
        minPrice: parseInt(minPrice),
        maxPrice: parseInt(maxPrice)
      })
    );
  };

  const onMinPriceChange = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setMinPrice(e.target.value)
    }
  }

  const onMaxPriceChange = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setMaxPrice(e.target.value)
    }
  }

  // useEffect(() => {
  //   if (cachedMinPriceFilter) setMinPrice(cachedMinPriceFilter);
  //   if (cachedMaxPriceFilter) setMaxPrice(cachedMaxPriceFilter);
  // }, []);

  return (
    <div {...props}>

      {(minPrice > 0 || maxPrice > 0) && (
        <div className="d-flex justify-content-between align-middle">
          <span>
            {minPrice && maxPrice && (
              <>{commify(minPrice)} - {commify(maxPrice)} CRO</>
            )}
            {minPrice && !maxPrice && (
              <>At least {commify(minPrice)} CRO</>
            )}
            {!minPrice && maxPrice && (
              <>Max {commify(maxPrice)} CRO</>
            )}
          </span>
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
                  value={minPrice}
                  onChange={onMinPriceChange}
                  style={{ marginBottom: 0, marginTop: 0 }}
                />
              </div>
              <div className="col-xl-6 col-lg-12 px-2 mt-2">
                <Form.Control
                  type="text"
                  placeholder="Max Price"
                  value={maxPrice}
                  onChange={onMaxPriceChange}
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
