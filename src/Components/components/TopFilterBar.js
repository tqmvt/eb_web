import React, { memo } from 'react';
import Select from 'react-select';
import { useSelector } from 'react-redux';

import { SortOption } from '../Models/sort-option.model';
import { FilterOption } from '../Models/filter-option.model';
import { getTheme } from '../../Theme/theme';

const TopFilterBar = ({
  showFilter = true,
  showSort = true,
  sortOptions = [],
  filterOptions = [],
  defaultSortValue = SortOption.default(),
  defaultFilterValue = FilterOption.default(),
  filterPlaceHolder = '',
  sortPlaceHolder = '',
  onFilterChange = () => {},
  onSortChange = () => {},
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

  return (
    <div className="items_filter" style={{ marginTop: '10px' }}>
      {showFilter && (
        <div className="dropdownSelect one">
          <Select
            styles={customStyles}
            placeholder={filterPlaceHolder}
            options={filterOptions}
            getOptionLabel={(option) => option.getOptionLabel}
            getOptionValue={(option) => option.getOptionValue}
            defaultValue={defaultFilterValue}
            value={filterValue}
            onChange={onFilterChange}
          />
        </div>
      )}
      {showSort && (
        <div className="dropdownSelect two">
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
        </div>
      )}
    </div>
  );
};

export default memo(TopFilterBar);
