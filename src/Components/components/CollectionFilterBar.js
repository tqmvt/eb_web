import React, { memo, useCallback } from 'react';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { sortOptions } from './constants/sort-options';
import { SortOption } from '../Models/sort-option.model';
import { listingFilterOptions } from './constants/filter-options';
import { sortListings, resetListings, searchListings } from '../../GlobalState/collectionSlice';
import { Form } from 'react-bootstrap';

const CollectionFilterBar = ({ cacheName = null }) => {
  const dispatch = useDispatch();

  const collection = useSelector((state) => state.collection);

  const selectDefaultSortValue = collection.cachedSort[cacheName] ?? SortOption.default();

  const selectSortOptions = useSelector((state) => {
    if (state.collection.hasRank) {
      return sortOptions;
    }

    return sortOptions.filter((s) => s.key !== 'rank');
  });

  const onSortChange = useCallback(
    (sortOption) => {
      dispatch(sortListings(sortOption, cacheName));
    },
    [dispatch]
  );

  const handleSearch = debounce((event) => {
    const { value } = event.target;
    dispatch(searchListings(value));
  }, 300);

  const handleClear = useCallback(() => {
    dispatch(resetListings());
  }, [dispatch]);

  const customStyles = {
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
  };

  function debounce(func, wait) {
    let timeout;
    return function () {
      const context = this;
      const args = arguments;
      const later = function () {
        timeout = null;
        func.apply(context, args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  return (
    <div className="row">
      <div className="col-md-3">
        <div className="items_filter" style={{ marginBottom: 0, marginTop: 0 }}>
          <div className="dropdownSelect two">
            <Select
              styles={customStyles}
              placeholder={'Sort Listings...'}
              options={[SortOption.default(), ...selectSortOptions]}
              getOptionLabel={(option) => option.getOptionLabel}
              getOptionValue={(option) => option.getOptionValue}
              defaultValue={selectDefaultSortValue}
              onChange={onSortChange}
            />
          </div>
        </div>
      </div>
      <div className="col-md-3">
        <Form.Control type="text" placeholder="Search by name" onChange={handleSearch} />
      </div>
      <div className="col-md-3">Total results (x out of z)</div>
      <div className="col-md-3">
        <div className="items_filter" style={{ marginBottom: 0, marginTop: 0 }}>
          <div className="dropdownSelect two">
            <Select
              styles={customStyles}
              placeholder={'Sort Listings...'}
              options={listingFilterOptions}
              defaultValue={listingFilterOptions[0]}
              onChange={onSortChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(CollectionFilterBar);
