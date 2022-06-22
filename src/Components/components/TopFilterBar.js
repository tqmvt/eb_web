import React, { memo } from 'react';
import Select from 'react-select';
import { useSelector } from 'react-redux';

import { SortOption } from '../Models/sort-option.model';
import { getTheme } from '../../Theme/theme';
import { Form } from 'react-bootstrap';
import styled from 'styled-components';

const CollectionFilterBarContainer = styled.div`
  margin: 0 0 22px;
`;

const TopFilterBar = ({
  showFilter = true,
  showSort = true,
  showSearch = true,
  sortOptions = [],
  filterOptions = [],
  defaultSortValue = SortOption.default(),
  defaultFilterValue = {value: null, label: 'All'},
  defaultSearchValue = '',
  filterPlaceHolder = '',
  sortPlaceHolder = '',
  onFilterChange = () => {},
  onSortChange = () => {},
  onSearch = () => {},
  sortValue = undefined,
  filterValue = undefined,
}) => {
  const userTheme = useSelector((state) => {
    return state.user.theme;
  });
  const customStyles = {
    option: (base, state) => ({
      ...base,
      background: getTheme(userTheme).colors.bgColor2,
      color: getTheme(userTheme).colors.textColor3,
      borderRadius: state.isFocused ? '0' : 0,
      '&:hover': {
        background: '#eee',
        color: '#000',
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

  const Filter = () => {
    return (
      <Select
        styles={customStyles}
        placeholder={filterPlaceHolder}
        options={filterOptions}
        getOptionLabel={(option) => option.label}
        getOptionValue={(option) => option.value}
        defaultValue={defaultFilterValue}
        value={filterValue}
        onChange={onFilterChange}
      />
    );
  };

  const Sort = () => {
    return (
      <Select
        styles={customStyles}
        placeholder={sortPlaceHolder}
        options={sortOptions}
        getOptionLabel={(option) => option.getOptionLabel}
        getOptionValue={(option) => option.getOptionValue}
        defaultValue={defaultSortValue}
        value={sortValue}
        onChange={onSortChange}
      />
    );
  };

  const Search = () => {
    return (
      <Form.Control
        type="text"
        placeholder="Search"
        onChange={onSearch}
        style={{ marginBottom: 0, marginTop: 0 }}
        defaultValue={defaultSearchValue}
      />
    );
  };

  return (
    <CollectionFilterBarContainer className="row align-items-center">
      <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 px-2 mt-2">
        <div className="items_filter" style={{ marginBottom: 0, marginTop: 0 }}>
          <div className="dropdownSelect two w-100 mr-0 mb-0">{showFilter ? <Filter /> : <Sort />}</div>
        </div>
      </div>
      <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 px-2 mt-2">
        <div className="items_filter" style={{ marginBottom: 0, marginTop: 0 }}>
          <div className="dropdownSelect two w-100 mr-0 mb-0">
            {showSort && <>{showFilter ? <Sort /> : <Search />}</>}
          </div>
        </div>
      </div>
      <div className="col-xl-3 px-2 mt-2 col-md-6 col-sm-12 d-sm-flex d-lg-none d-xl-flex" />
      <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12 px-2 mt-2">
        <div className="items_filter" style={{ marginBottom: 0, marginTop: 0 }}>
          <div className="dropdownSelect two w-100 mr-0 mb-0">{showSearch && showFilter && <Search />}</div>
        </div>
      </div>
    </CollectionFilterBarContainer>
  );
};

export default memo(TopFilterBar);
