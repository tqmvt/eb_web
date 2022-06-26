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
  const currentFilter = useSelector((state) => {
    console.log('asdf', state.collection.query.filter.minPrice)
    return state.collection.query.filter
  });

  const [minPrice, setMinPrice] = useState(currentFilter.minPrice);
  const [maxPrice, setMaxPrice] = useState(currentFilter.maxPrice);
  const [minRank, setMinRank] = useState(currentFilter.minRank);
  const [maxRank, setMaxRank] = useState(currentFilter.maxRank);

  const hasActiveRangeFilter = () => {
    return !!currentFilter.minPrice ||
      !!currentFilter.maxPrice ||
      !!currentFilter.minRank ||
      !!currentFilter.maxRank;
  };

  const clearAttributeFilters = () => {
    currentFilter.minPrice = null;
    currentFilter.maxPrice = null;
    currentFilter.minRank = null;
    currentFilter.maxRank = null;

    pushQueryString(router, {
      slug: router.query.slug,
      ...currentFilter.toPageQuery()
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
    currentFilter.minPrice = isNaN(parseInt(minPrice)) ? null : parseInt(minPrice);
    currentFilter.maxPrice = isNaN(parseInt(maxPrice)) ? null : parseInt(maxPrice);;
    currentFilter.minRank = isNaN(parseInt(minRank)) ? null : parseInt(minRank);;
    currentFilter.maxRank = isNaN(parseInt(maxRank)) ? null : parseInt(maxRank);;

    pushQueryString(router, {
      slug: router.query.slug,
      ...currentFilter.toPageQuery()
    });

    dispatch(
      filterListingsByPrice({
        address,
        minPrice: currentFilter.minPrice,
        maxPrice: currentFilter.maxPrice,
        minRank: currentFilter.minRank,
        maxRank: currentFilter.maxRank,
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
      {hasActiveRangeFilter() && (
        <div className="d-flex flex-wrap justify-content-between align-middle mb-2">
          <div className="me-2">
            <ThemedBadge>
              {currentFilter.minPrice && currentFilter.maxPrice ? (
                <>
                  {commify(currentFilter.minPrice)} - {commify(currentFilter.maxPrice)} CRO
                </>
              )
                : currentFilter.minPrice && !currentFilter.maxPrice ? <>At least {commify(currentFilter.minPrice)} CRO</>
                : !currentFilter.minPrice && currentFilter.maxPrice && <>Max {commify(currentFilter.maxPrice)} CRO</>
              }
            </ThemedBadge>
          </div>
          <div className="me-2">
            <ThemedBadge>
              {currentFilter.minRank && currentFilter.maxRank && (
                <>
                  Rank {commify(currentFilter.minRank)} - {commify(currentFilter.maxRank)}
                </>
              )}
              {currentFilter.minRank && !currentFilter.maxRank && <>At least rank {commify(currentFilter.minRank)}</>}
              {!currentFilter.minRank && currentFilter.maxRank && <>Max rank {commify(currentFilter.maxRank)}</>}
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

      <Accordion defaultActiveKey={hasActiveRangeFilter() ? 'price' : undefined}>
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
