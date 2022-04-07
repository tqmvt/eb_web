import { createSlice } from '@reduxjs/toolkit';
import {
  sortAndFetchListings,
  getCollectionMetadata,
  getCollectionTraits,
  getCollectionPowertraits,
} from '../core/api';
import {caseInsensitiveCompare} from "../utils";

const collectionSlice = createSlice({
  name: 'collection',
  initialState: {
    loading: false,
    error: false,
    listings: [],
    query: {
      page: 0,
      filter: {},
      sort: {},
      search: null,
      traits: {},
      powertraits: {},
    },
    totalPages: 0,
    stats: null,
    hasRank: false,
    cachedTraitsFilter: {},
    cachedPowertraitsFilter: {},
    cachedFilter: {},
    cachedSort: {},
  },
  reducers: {
    listingsLoading: (state, _) => {
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
      state.query.page = 0;
      state.query.filter = {};
      state.query.sort = {};
      state.query.search = null;

      if (hardClear) {
        state.cachedTraitsFilter = {};
        state.cachedPowertraitsFilter = {};
        state.cachedFilter = {};
        state.cachedSort = {};
      }
    },
    onFilter: (state, action) => {
      const { cacheName, option } = action.payload;

      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;
      state.query.filter = option;

      if (cacheName) {
        state.cachedFilter[cacheName] = option;
      }
    },
    onSort: (state, action) => {
      const { cacheName, option } = action.payload;

      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;
      state.query.sort = option;

      if (cacheName) {
        state.cachedSort[cacheName] = option;
      }
    },
    onSearch: (state, action) => {
      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;
      state.query.search = action.payload;
    },
    onTraitFilter: (state, action) => {
      const { address, traits, powertraits } = action.payload;

      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;

      if (traits) {
        state.query.traits = traits;
      }
      if (powertraits) {
        state.query.powertraits = powertraits;
      }
      if (address && traits) {
        state.cachedTraitsFilter[address] = traits;
      }
      if (address && powertraits) {
        state.cachedPowertraitsFilter[address] = powertraits;
      }
    },
    onCollectionStatsLoaded: (state, action) => {
      state.stats = action.payload.stats;
    },
  },
});

export const {
  listingsLoading,
  listingsReceived,
  onFilter,
  onSort,
  onSearch,
  onTraitFilter,
  clearSet,
  onCollectionStatsLoaded,
} = collectionSlice.actions;

export default collectionSlice.reducer;

export const init = (filterOption, sortOption, traitFilterOption, address) => async (dispatch) => {
  dispatch(clearSet(false));

  dispatch(onFilter({ option: filterOption }));

  if (sortOption) {
    dispatch(onSort({ option: sortOption }));
  }

  //  TODO: needs DTO
  if (traitFilterOption) {
    dispatch(onTraitFilter({ traits: traitFilterOption, address }));
  }
};

export const fetchListings = () => async (dispatch, getState) => {
  const state = getState();

  dispatch(listingsLoading());
  const { response, cancelled } = await sortAndFetchListings(
    state.collection.query.page + 1,
    state.collection.query.sort,
    state.collection.query.filter,
    state.collection.query.traits,
    state.collection.query.powertraits,
    state.collection.query.search
  );

  if (!cancelled) {
    response.hasRank = response.listings.length > 0 && typeof response.listings[0].nft.rank !== 'undefined';
    dispatch(listingsReceived(response));
  }
};

export const filterListings = (filterOption, cacheName) => async (dispatch) => {
  dispatch(onFilter({ option: filterOption, cacheName }));
  dispatch(fetchListings());
};

export const sortListings = (sortOption, cacheName) => async (dispatch) => {
  dispatch(onSort({ option: sortOption, cacheName }));
  dispatch(fetchListings());
};

export const searchListings = (value) => async (dispatch) => {
  dispatch(onSearch(value));
  dispatch(fetchListings());
};

export const filterListingsByTrait =
  ({ traits, powertraits, address }) =>
  async (dispatch) => {
    dispatch(onTraitFilter({ traits, powertraits, address }));
    dispatch(fetchListings());
  };

export const resetListings = () => async (dispatch) => {
  dispatch(clearSet());
  dispatch(fetchListings());
};

export const getStats = (address, id = null, extraAddresses = null) => async (dispatch) => {
  try {
    const mergedAddresses = extraAddresses ? [address, ...extraAddresses] : address;
    var response;
    if (id != null) {
      response = await getCollectionMetadata(
        mergedAddresses,
        null, {
          type: "tokenId",
          value: id
        }
      );
    } else {
      response = await getCollectionMetadata(mergedAddresses);
    }
    const traits = await getCollectionTraits(address);
    const powertraits = await getCollectionPowertraits(address);
    dispatch(
      onCollectionStatsLoaded({
        stats: {
          ...combineStats(response.collections, address),
          ...{
            traits: traits,
            powertraits: powertraits,
          },
        },
      })
    );
  } catch (error) {
    console.log(error);
  }
};

/**
 * Combine stats if a collection tracks multiple contracts
 *
 * @param collectionStats stats returned from the API
 * @param anchor primary collection address in which to merge the stats
 * @returns {*}
 */
const combineStats = (collectionStats, anchor) => {
  const anchoredStats = collectionStats.find(c => caseInsensitiveCompare(c.address, anchor));
  const combined = collectionStats.reduce((a, b) => {
    return {
      numberActive: parseInt(a.numberActive) + parseInt(b.numberActive),
      volume1d: parseInt(a.volume1d) + parseInt(b.volume1d),
      volume7d: parseInt(a.volume7d) + parseInt(b.volume7d),
      volume30d: parseInt(a.volume30d) + parseInt(b.volume30d),
      totalVolume: parseInt(a.totalVolume) + parseInt(b.totalVolume),
      numberOfSales: parseInt(a.numberOfSales) + parseInt(b.numberOfSales),
      sales1d: parseInt(a.sales1d) + parseInt(b.sales1d),
      sales7d: parseInt(a.sales7d) + parseInt(b.sales7d),
      sales30d: parseInt(a.sales30d) + parseInt(b.sales30d),
      totalRoyalties: parseInt(a.totalRoyalties) + parseInt(b.totalRoyalties)
    }
  })

  return {...anchoredStats, ...combined};
}