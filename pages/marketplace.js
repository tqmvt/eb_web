import React, { useCallback, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import ListingCollection from '../src/Components/components/ListingCollection';
import Footer from '../src/Components/components/Footer';
import TopFilterBar from '../src/Components/components/TopFilterBar';
import { sortOptions } from '../src/Components/components/constants/sort-options';
import { marketPlaceCollectionFilterOptions } from '../src/Components/components/constants/filter-options';
import SalesCollection from '../src/Components/components/SalesCollection';
import { filterListings, getMarketData, searchListings, sortListings } from '../src/GlobalState/marketplaceSlice';
import { debounce, siPrefixedNumber } from '../src/utils';
import { SortOption } from '../src/Components/Models/sort-option.model';
import { ListingsFilterOption } from '../src/Components/Models/listings-filter-option.model';

const Marketplace = () => {
  const cacheName = 'marketplace';

  const dispatch = useDispatch();

  const marketplace = useSelector((state) => {
    return state.marketplace;
  });

  const marketData = useSelector((state) => {
    return state.marketplace.marketData;
  });

  const [openMenu, setOpenMenu] = React.useState(0);
  const handleBtnClick = (index) => (element) => {
    var elements = document.querySelectorAll('.tab');
    for (var i = 0; i < elements.length; i++) {
      elements[i].classList.remove('active');
    }
    element.target.parentElement.classList.add('active');

    setOpenMenu(index);
  };

  useEffect(() => {
    dispatch(getMarketData());
    // eslint-disable-next-line
  }, []);

  const selectDefaultFilterValue = marketplace.cachedFilter[cacheName] ?? ListingsFilterOption.default();
  const selectDefaultSortValue = marketplace.cachedSort[cacheName] ?? SortOption.default();
  const selectDefaultSearchValue = marketplace.cachedSearch[cacheName] ?? '';

  const selectFilterOptions = marketPlaceCollectionFilterOptions;
  const selectSortOptions = useSelector((state) => {
    if (state.marketplace.hasRank) {
      return sortOptions;
    }

    return sortOptions.filter((s) => s.key !== 'rank');
  });

  const onFilterChange = useCallback(
    (filterOption) => {
      dispatch(filterListings(filterOption, cacheName));
    },
    [dispatch]
  );

  const onSortChange = useCallback(
    (sortOption) => {
      dispatch(sortListings(sortOption, cacheName));
    },
    [dispatch]
  );

  const onSearch = debounce((event) => {
    const { value } = event.target;
    dispatch(searchListings(value, cacheName));
  }, 300);

  return (
    <div>
      <section className="jumbotron breadcumb no-bg tint">
        <div className="mainbreadcumb">
          <div className="container">
            <div className="row m-10-hor">
              <div className="col-12">
                <h1 className="text-center">Marketplace</h1>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container">
        <div className="row">
          {marketData && (
            <div className="d-item col-lg-6 col-sm-10 mb-4 mx-auto">
              <div className="nft_attr">
                <div className="row">
                  <div className="col-4">
                    <h5>Volume</h5>
                    <h4>{siPrefixedNumber(Number(marketData.totalVolume).toFixed(0))} CRO</h4>
                  </div>
                  <div className="col-4">
                    <h5>Sales</h5>
                    <h4>{siPrefixedNumber(Number(marketData.totalSales).toFixed(0))}</h4>
                  </div>
                  <div className="col-4">
                    <h5>Active</h5>
                    <h4>{siPrefixedNumber(marketData.totalActive)}</h4>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="de_tab">
          <ul className="de_nav mb-2">
            <li id="Mainbtn0" className="tab active">
              <span onClick={handleBtnClick(0)}>Listings</span>
            </li>
            <li id="Mainbtn1" className="tab">
              <span onClick={handleBtnClick(1)}>Activity</span>
            </li>
          </ul>

          <div className="de_tab_content">
            {openMenu === 0 && (
              <div className="tab-1 onStep fadeIn">
                <div className="row">
                  <div className="col-lg-12">
                    <TopFilterBar
                      showFilter={true}
                      showSort={true}
                      sortOptions={[SortOption.default(), ...selectSortOptions]}
                      filterOptions={[ListingsFilterOption.default(), ...selectFilterOptions]}
                      defaultSortValue={selectDefaultSortValue}
                      defaultFilterValue={selectDefaultFilterValue}
                      defaultSearchValue={selectDefaultSearchValue}
                      filterPlaceHolder="Filter Collection..."
                      sortPlaceHolder="Sort Listings..."
                      onFilterChange={onFilterChange}
                      onSortChange={onSortChange}
                      onSearch={onSearch}
                    />
                  </div>
                </div>
                <ListingCollection cacheName="marketplace" />
              </div>
            )}
            {openMenu === 1 && (
              <div className="tab-2 onStep fadeIn">
                <SalesCollection cacheName="marketplace" />
              </div>
            )}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
export default Marketplace;