import { createSlice } from '@reduxjs/toolkit';
import { sortAndFetchListings, getCollectionMetadata, getMarketMetadata } from '../core/api';
import { SortOption } from '../Components/Models/sort-option.model';
import {MarketFilters} from "../Components/Models/market-filters.model";
import {ListingsQuery} from "../core/api/listings/query";

const marketplaceSlice = createSlice({
  name: 'marketplace',
  initialState: {
    loading: false,
    error: false,
    listings: [],
    query: {
      page: 0,
      filter: MarketFilters.default(),
      sort: {},
    },
    totalPages: 0,
    collection: null,
    marketData: null,
    hasRank: false,
    cachedFilter: {},
    cachedSort: {},
  },
  reducers: {
    listingsLoading: (state, action) => {
      state.loading = true;
      state.error = false;
    },
    listingsReceived: (state, action) => {
      state.loading = false;
      state.error = false;
      state.listings.push(...action.payload.listings);
      state.query.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.hasRank = action.payload.hasRank;
    },
    clearSet: (state, action) => {
      const hardClear = action.payload || false;

      state.listings = [];
      state.totalPages = 0;
      state.query.filter = MarketFilters.default();
      state.query.sort = SortOption.default();
    },
    onFilter: (state, action) => {
      const { cacheName, option } = action.payload;

      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;
      state.query.filter = option;
    },
    onSort: (state, action) => {
      const { cacheName, option } = action.payload;

      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;
      state.query.sort = option;
    },
    onSearch: (state, action) => {
      const { cacheName, search } = action.payload;

      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;
      state.query.filter.search = search;
    },
    onCollectionFilter: (state, action) => {
      const { cacheName, option } = action.payload;

      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;
      state.query.filter.collection = option;
    },
    onCollectionDataLoaded: (state, action) => {
      state.collection = action.payload.collection;
    },
    onMarketDataLoaded(state, action) {
      state.marketData = action.payload.marketdata;
    },
  },
  // extraReducers: (builder) => {
  //     builder.addCase(getListings.fulfilled, (state, action) => {
  //         state.listings = action.payload;
  //     })
  // }
});

export const {
  listingsLoading,
  listingsReceived,
  onFilter,
  onSort,
  onSearch,
  clearSet,
  onCollectionDataLoaded,
  onRankingsLoaded,
  onMarketDataLoaded,
  onCollectionFilter,
} = marketplaceSlice.actions;

export default marketplaceSlice.reducer;

export const init = (sortOption, filterOption) => async (dispatch, getState) => {
  dispatch(clearSet(false));

  if (sortOption && sortOption instanceof SortOption) {
    dispatch(onSort({ option: sortOption }));
  }

  if (filterOption && filterOption instanceof MarketFilters) {
    dispatch(onFilter({ option: filterOption }));
  }
};

export const fetchListings =
  (isSales = false) =>
  async (dispatch, getState) => {
    const state = getState();


    dispatch(listingsLoading());
    const { response, cancelled } = await sortAndFetchListings(
      state.marketplace.query.page + 1,
      state.marketplace.query.sort,
      ListingsQuery.fromMarketFilter(state.marketplace.query.filter.toQuery()),
      isSales ? 1 : 0,
      state.marketplace.query.filter.limit
    );

    if (!cancelled) {
      response.hasRank = response.listings.length > 0 && typeof response.listings[0].nft.rank !== 'undefined';
      dispatch(listingsReceived(response));
    }
  };

export const filterListings =
  (filterOption, cacheName, isSales = false) =>
  async (dispatch) => {
    dispatch(onCollectionFilter({ option: filterOption, cacheName }));
    dispatch(fetchListings(isSales));
  };

export const sortListings =
  (sortOption, cacheName, isSales = false) =>
  async (dispatch) => {
    dispatch(onSort({ option: sortOption, cacheName }));
    dispatch(fetchListings(isSales));
  };

export const searchListings = (value, cacheName, isSales) => async (dispatch) => {
  dispatch(onSearch({ search: value, cacheName }));
  dispatch(fetchListings(isSales));
};

export const resetListings =
  (isSales = false) =>
  async (dispatch) => {
    dispatch(clearSet());
    dispatch(fetchListings(isSales));
  };

export const getCollectionData = (address) => async (dispatch) => {
  try {
    const response = await getCollectionMetadata(address);
    dispatch(
      onCollectionDataLoaded({
        collection: response.collections[0],
      })
    );
  } catch (error) {
    console.log(error);
  }
};

export const getMarketData = () => async (dispatch) => {
  try {
    const response = await getMarketMetadata();
    dispatch(
      onMarketDataLoaded({
        marketdata: response,
      })
    );
  } catch (error) {
    console.log(error);
  }
};
