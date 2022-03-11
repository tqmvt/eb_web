import React, { memo, useCallback } from 'react';
import Select from 'react-select';
import { useDispatch, useSelector } from 'react-redux';
import { sortOptions } from './constants/sort-options';
import { SortOption } from '../Models/sort-option.model';
import { listingFilterOptions } from './constants/filter-options';
import { sortListings, resetListings, searchListings } from '../../GlobalState/collectionSlice';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';

const CollectionFilterBarContainer = styled.div`
  margin: 0 0 22px;
`;

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
    <CollectionFilterBarContainer className="row align-items-center">
      <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 px-2 mt-2">
        <div className="items_filter" style={{ marginBottom: 0, marginTop: 0 }}>
          <div className="dropdownSelect two w-100 mr-0 mb-0">
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
      <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 px-2 mt-2">
        <Form.Control
          type="text"
          placeholder="Search by name"
          onChange={handleSearch}
          style={{ marginBottom: 0, marginTop: 0 }}
        />
      </div>
      <div className="col-xl-3 px-2 mt-2 col-md-6 col-sm-12 d-sm-flex d-lg-none d-xl-flex">
        Total results (x out of z)
      </div>
      <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 px-2 mt-2">
        <div className="items_filter" style={{ marginBottom: 0, marginTop: 0 }}>
          <div className="dropdownSelect two w-100 mr-0 mb-0">
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
    </CollectionFilterBarContainer>
  );
};

export default memo(CollectionFilterBar);
