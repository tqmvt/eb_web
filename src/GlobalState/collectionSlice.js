import {createSlice} from '@reduxjs/toolkit';
import {
  getCollectionMetadata,
  getCollectionPowertraits,
  getCollectionTraits,
  sortAndFetchCollectionDetails,
  sortAndFetchListings,
} from '../core/api';
import {caseInsensitiveCompare} from '../utils';
import {appConfig} from "../Config";
import {listingType} from "../core/api/enums";
import {ListingsQuery} from "../core/api/listings/query";
import {FullCollectionsQuery} from "../core/api/fullcollections/query";
import {CollectionFilters} from "../Components/Models/collection-filters.model";

const knownContracts = appConfig('collections');

const collectionSlice = createSlice({
  name: 'collection',
  initialState: {
    loading: false,
    error: false,
    listings: [],
    query: {
      page: 0,
      filter: CollectionFilters.default(),
      sort: {},
    },
    totalPages: 0,
    totalCount: 0,
    statsLoading: false,
    stats: null,
    hasRank: false,
    isUsingListingsFallback: false,
    initialLoadComplete: false,
  },
  reducers: {
    listingsLoading: (state, _) => {
      state.loading = true;
      state.error = false;
      state.initialLoadComplete = state.query.page !== 0;
    },
    listingsReceived: (state, action) => {
      state.loading = false;
      state.error = false;
      state.listings.push(...(action.payload.isUsingListingsFallback ? action.payload.listings : action.payload.nfts));
      state.query.page = action.payload.page;
      state.totalPages = action.payload.totalPages;
      state.totalCount = action.payload.totalCount;
      state.hasRank = action.payload.hasRank;
      state.isUsingListingsFallback = action.payload.isUsingListingsFallback;
      state.initialLoadComplete = true;
    },
    clearSet: (state, action) => {
      const hardClear = action.payload || false;

      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;
      state.query.filter = CollectionFilters.default();
      state.query.sort = {};
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
      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;
      state.query.filter.search = action.payload;
    },
    onListedFilter: (state, action) => {
      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;
      state.query.filter.listed = action.payload;
    },
    onTraitFilter: (state, action) => {
      const { address, traits, powertraits } = action.payload;

      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;

      if (traits) {
        state.query.filter.traits = traits;
      }
      if (powertraits) {
        state.query.filter.powertraits = powertraits;
      }
    },
    onPriceFilter: (state, action) => {
      const { address, minPrice, maxPrice, minRank, maxRank } = action.payload;

      state.listings = [];
      state.totalPages = 0;
      state.query.page = 0;
      state.query.filter.minPrice = minPrice;
      state.query.filter.maxPrice = maxPrice;
      state.query.filter.minRank = minRank;
      state.query.filter.maxRank = maxRank;
    },
    onCollectionStatsLoaded: (state, action) => {
      state.stats = action.payload.stats;
      state.statsLoading = false;
    },
    onCollectionStatsLoading: (state, _) => {
      state.statsLoading = true;
      state.error = false;
    },
    onTabUpdated: (state, action) => {
      state.query.filter.tab = action.payload;
    },
  },
});

export const {
  listingsLoading,
  listingsReceived,
  onFilter,
  onSort,
  onSearch,
  onListedFilter,
  onTraitFilter,
  onPriceFilter,
  clearSet,
  onCollectionStatsLoading,
  onCollectionStatsLoaded,
  onTabUpdated,
} = collectionSlice.actions;

export default collectionSlice.reducer;

export const init = (filterOption, sortOption) => async (dispatch) => {
  dispatch(clearSet(false));

  if (sortOption) {
    dispatch(onSort({ option: sortOption }));
  }

  dispatch(onFilter({ option: filterOption }));
};

export const fetchListings =
  (findAllListings = false) =>
  async (dispatch, getState) => {
    const state = getState();
    dispatch(listingsLoading());

    const address = state.collection.query.filter.address;
    const weirdApes = Array.isArray(address);
    const knownContract = weirdApes
      ? null
      : knownContracts.find((c) => caseInsensitiveCompare(c.address, address));
    const fallbackContracts = ['red-skull-potions', 'cronos-fc'];
    const pageSizeOverride = findAllListings ? 1208 : null;

    if (weirdApes || fallbackContracts.includes(knownContract.slug)) {
      const { response, cancelled } = await sortAndFetchListings(
        state.collection.query.page + 1,
        state.collection.query.sort,
        ListingsQuery.fromCollectionFilter(state.collection.query.filter.toQuery()),
      );

      if (!cancelled) {
        response.hasRank =
          response.listings.length > 0 &&
          (typeof response.listings[0].rank !== 'undefined' || !!response.listings[0].nft.rank);
        dispatch(listingsReceived({ ...response, isUsingListingsFallback: true }));
      }
    } else {
      const { response, cancelled } = await sortAndFetchCollectionDetails(
        state.collection.query.page + 1,
        state.collection.query.sort,
        FullCollectionsQuery.createApiQuery(state.collection.query.filter.toQuery()),
        pageSizeOverride
      );

      if (response.status === 200) {
        if (!cancelled) {

          // @todo remove once proper filter in place on API side
          response.nfts = response.nfts?.filter((nft) => !nft.market.type || nft.market.type === listingType.LISTING);

          response.hasRank = response.nfts.length > 0 && typeof response.nfts[0].rank !== 'undefined';
          dispatch(listingsReceived({ ...response, isUsingListingsFallback: false }));
        }
      }
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

export const filterListingsByListed = (options) => async (dispatch) => {
  dispatch(onListedFilter(options));
  dispatch(fetchListings());
};

export const filterListingsByTrait =
  ({ traits, powertraits, address }) =>
  async (dispatch) => {
    dispatch(onTraitFilter({ traits, powertraits, address }));
    dispatch(fetchListings());
  };

export const filterListingsByPrice =
  ({ address, minPrice, maxPrice, minRank, maxRank }) =>
    async (dispatch) => {
  dispatch(onPriceFilter({ minPrice, maxPrice, address, minRank, maxRank }));
  dispatch(fetchListings());
};

export const resetListings = () => async (dispatch) => {
  dispatch(clearSet());
  dispatch(fetchListings());
};

export const updateTab = (tab) => async (dispatch) => {
  dispatch(onTabUpdated(tab));
};

export const getStats =
  (address, slug, id = null, extraAddresses = null) =>
  async (dispatch) => {
    try {
      const mergedAddresses = extraAddresses ? [address, ...extraAddresses] : address;
      var response;
      if (id != null) {
        response = await getCollectionMetadata(mergedAddresses, null, {
          type: 'tokenId',
          value: id,
        });
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
  const anchoredStats = collectionStats.find((c) => caseInsensitiveCompare(c.collection, anchor));
  if (collectionStats.length === 0) return anchoredStats;

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
      totalRoyalties: parseInt(a.totalRoyalties) + parseInt(b.totalRoyalties),
      floorPrice: parseInt(a.floorPrice) < parseInt(b.floorPrice) ? parseInt(a.floorPrice) : parseInt(b.floorPrice),
      averageSalePrice: (parseInt(a.averageSalePrice) + parseInt(b.averageSalePrice)) / 2,
    };
  });

  return { ...anchoredStats, ...combined };
};
