import React, { memo, useEffect, useState } from 'react';
import {Accordion, Badge, Form} from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMinus, faPlus } from '@fortawesome/free-solid-svg-icons';

import {humanize, isEmptyObj, mapAttributeString} from '../../../utils';
import { filterListingsByTrait } from '../../../GlobalState/collectionSlice';
import styles from './filters.module.scss';
import {useRouter} from "next/router";
import {cleanedQuery, pushQueryString} from "../../../helpers/query";

const PowertraitsFilter = ({ address }) => {
  const dispatch = useDispatch();
  const router = useRouter();

  const userTheme = useSelector((state) => state.user.theme);
  const collectionStats = useSelector((state) => state.collection.stats);
  const collectionCachedTraitsFilter = useSelector((state) => state.collection.query.filter.powertraits);
  const currentFilter = useSelector((state) => state.collection.query.filter);

  const [hideAttributes, setHideAttributes] = useState(typeof window !== 'undefined' && window.innerWidth < 768);

  const viewPowertraitsList = () => {
    if (!collectionStats || !collectionStats.powertraits) {
      return [];
    }

    return Object.entries(collectionStats.powertraits);
  };

  const viewSelectedAttributesCount = () => {
    const cachedTraitsFilter = collectionCachedTraitsFilter || {};
    return Object.values(cachedTraitsFilter)
      .map((traitCategoryValue) => Object.values(traitCategoryValue).length)
      .reduce((prev, curr) => prev + curr, 0);
  };

  const traitStatName = (name, stats) => {
    let ret = mapAttributeString(name, address, true);

    if (stats && stats.count > 0) {
      ret = ret.concat(` (${stats.count})`);
    }

    return ret;
  };

  const viewGetDefaultCheckValue = (traitCategory, id) => {
    const cachedTraitsFilter = collectionCachedTraitsFilter || {};

    if (!cachedTraitsFilter || !cachedTraitsFilter[traitCategory]) {
      return false;
    }

    return cachedTraitsFilter[traitCategory].includes(id) || false;
  };

  const clearAttributeFilters = () => {
    const inputs = document.querySelectorAll('.powertrait-checkbox input[type=checkbox]');
    for (const item of inputs) {
      item.checked = false;
    }

    currentFilter.powertraits = {};

    pushQueryString(router, {
      slug: router.query.slug,
      ...currentFilter.toPageQuery()
    });

    dispatch(
      filterListingsByTrait({
        powertraits: currentFilter.powertraits,
        address,
      })
    );
  };

  const handleCheck = (event, traitCategory) => {
    const { id, checked } = event.target;

    const currentTraitFilters = collectionCachedTraitsFilter || {};

    let allTraits = cleanedQuery({
      ...currentTraitFilters,
      [traitCategory]: [
        ...(currentTraitFilters[traitCategory] || []),
        id
      ].filter((v, i, a) => a.indexOf(v) === i && (v !== id || checked)),
    });

    currentFilter.powertraits = allTraits;

    pushQueryString(router, {
      slug: router.query.slug,
      ...currentFilter.toPageQuery()
    });

    dispatch(
      filterListingsByTrait({
        powertraits: allTraits,
        address,
      })
    );
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

  useEffect(() => {
    const container = document.getElementById('powertraits');
    if (container) {
      container.style.display = hideAttributes ? 'none' : 'block';
    }
  }, [hideAttributes]);

  return (
    <div className="my-4">
      <div className="mb-2">
        <div className="d-flex justify-content-between align-middle">
          <h3
            className="d-inline-block"
            onClick={() => setHideAttributes(!hideAttributes)}
            style={{ cursor: 'pointer', marginBottom: 0 }}
          >
            In-Game Attributes
          </h3>

          <div className="d-inline-block fst-italic my-auto me-2" style={{ fontSize: '0.8em', cursor: 'pointer' }}>
            <FontAwesomeIcon id="powertraits-expand-icon" icon={hideAttributes ? faPlus : faMinus} />
          </div>
        </div>
        {viewSelectedAttributesCount() > 0 && (
          <div className="d-flex justify-content-between align-middle">
            <ThemedBadge>
              <span>{viewSelectedAttributesCount()} selected</span>
            </ThemedBadge>
            <div
              className="d-inline-block fst-italic my-auto me-2"
              style={{ fontSize: '0.8em', cursor: 'pointer' }}
              onClick={clearAttributeFilters}
            >
              Clear
            </div>
          </div>
        )}
      </div>
      <Accordion id="powertraits" className={`${hideAttributes ? 'd-none' : ''} ${styles.powertraits}`}>
        {viewPowertraitsList()
          .sort((a, b) => (a[0].toLowerCase() > b[0].toLowerCase() ? 1 : -1))
          .map(([traitCategoryName, traitCategoryValues], key) => (
            <Accordion.Item eventKey={key} key={key}>
              <Accordion.Header>{humanize(traitCategoryName)}</Accordion.Header>
              <Accordion.Body>
                {Object.entries(traitCategoryValues)
                  .filter((t) => t[1].count > 0)
                  .sort((a, b) => {
                    if (!isNaN(a[0]) && !isNaN(b[0])) {
                      return parseInt(a[0]) > parseInt(b[0]) ? 1 : -1;
                    }
                    return a[0] > b[0] ? 1 : -1;
                  })
                  .map((stats) => (
                    <div key={`${traitCategoryName}-${stats[0]}`}>
                      <Form.Check
                        type="checkbox"
                        id={stats[0]}
                        className="powertrait-checkbox"
                        label={traitStatName(stats[0], stats[1])}
                        defaultChecked={viewGetDefaultCheckValue(traitCategoryName, stats[0])}
                        value={viewGetDefaultCheckValue(traitCategoryName, stats[0])}
                        onChange={(t) => handleCheck(t, traitCategoryName)}
                      />
                    </div>
                  ))}
              </Accordion.Body>
            </Accordion.Item>
          ))}
      </Accordion>
    </div>
  );
};

export default memo(PowertraitsFilter);
