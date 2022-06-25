import React, { memo, useState } from 'react';
import {Accordion, Badge, Form} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { filterListingsByPrice } from '../../GlobalState/collectionSlice';
import Button from '../components/Button';
import { commify } from 'ethers/lib/utils';
import {pushQueryString} from "../../helpers/query";
import {useRouter} from "next/router";

const PriceRangeFilter = ({ address, ...props }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const userTheme = useSelector((state) => state.user.theme);
  const currentFilter = useSelector((state) => state.collection.query.filter);

  const [minPrice, setMinPrice] = useState(null);
  const [maxPrice, setMaxPrice] = useState(null);
  const [minRank, setMinRank] = useState(null);
  const [maxRank, setMaxRank] = useState(null);

  const clearAttributeFilters = () => {
    setMinPrice('');
    setMaxPrice('');
    setMinRank('');
    setMaxRank('');

    const query = currentFilter.toPageQuery();
    query.minPrice = null;
    query.maxPrice = null;
    query.minRank = null;
    query.maxRank = null;

    pushQueryString(router, {
      slug: router.query.slug,
      ...query
    });

    dispatch(
      filterListingsByPrice({
        address,
        minPrice: null,
        maxPrice: null,
        minRank: null,
        maxRank: null,
      })
    );
  };

  const onApply = () => {

    const query = currentFilter.toPageQuery();
    query.minPrice = minPrice;
    query.maxPrice = maxPrice;
    query.minRank = minRank;
    query.maxRank = maxRank;

    pushQueryString(router, {
      slug: router.query.slug,
      ...query
    });

    dispatch(
      filterListingsByPrice({
        address,
        minPrice: parseInt(minPrice),
        maxPrice: parseInt(maxPrice),
        minRank: parseInt(minRank),
        maxRank: parseInt(maxRank),
      })
    );
  };

  const onMinPriceChange = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setMinPrice(e.target.value);
    }
  };

  const onMaxPriceChange = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setMaxPrice(e.target.value);
    }
  };

  const onMinRankChange = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setMinRank(e.target.value);
    }
  };

  const onMaxRankChange = (e) => {
    const re = /^[0-9\b]+$/;
    if (e.target.value === '' || re.test(e.target.value)) {
      setMaxRank(e.target.value);
    }
  };

  const ThemedBadge = (props) => {
    return (
      <Badge
        pill
        bg={userTheme === 'dark' ? 'light' : 'dark'}
        text={userTheme === 'dark' ? 'dark' : 'light'}
      >
        {props.children}
      </Badge>
    )
  }

  return (
    <div {...props}>
      {(minPrice > 0 || maxPrice > 0) && (
        <div className="d-flex flex-wrap justify-content-between align-middle mb-2">
          <div className="me-2">
            <ThemedBadge>
              {minPrice && maxPrice && (
                <>
                  {commify(minPrice)} - {commify(maxPrice)} CRO
                </>
              )}
              {minPrice && !maxPrice && <>At least {commify(minPrice)} CRO</>}
              {!minPrice && maxPrice && <>Max {commify(maxPrice)} CRO</>}
            </ThemedBadge>
          </div>
          <div className="me-2">
            <ThemedBadge>
              {minRank && maxRank && (
                <>
                  Rank {commify(minRank)} - {commify(maxRank)}
                </>
              )}
              {minRank && !maxRank && <>At least rank {commify(minRank)}</>}
              {!minRank && maxRank && <>Max rank {commify(maxRank)}</>}
            </ThemedBadge>
          </div>
          <div
            className="d-inline-block fst-italic my-auto flex-grow-1 text-end"
            style={{ fontSize: '0.8em', cursor: 'pointer' }}
            onClick={clearAttributeFilters}
          >
            Clear
          </div>
        </div>
      )}

      <Accordion>
        <Accordion.Item eventKey="price">
          <Accordion.Header>
            <h3 className="my-1">Range Filters</h3>
          </Accordion.Header>
          <Accordion.Body>
            <div className="row">
              <h5 className="mb-0">Price</h5>
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
            <div className="row mt-4">
              <h5 className="mb-0">Rank</h5>
              <div className="col-xl-6 col-lg-12 px-2 mt-2">
                <Form.Control
                  type="text"
                  placeholder="Min Rank"
                  value={minRank}
                  onChange={onMinRankChange}
                  style={{ marginBottom: 0, marginTop: 0 }}
                />
              </div>
              <div className="col-xl-6 col-lg-12 px-2 mt-2">
                <Form.Control
                  type="text"
                  placeholder="Max Rank"
                  value={maxRank}
                  onChange={onMaxRankChange}
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
