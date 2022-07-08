import {appConfig} from "../../../Config";
import {MarketFilterCollection} from "../../Models/market-filters.model";

const knownContracts = appConfig('collections');

export const limitSizeOptions = {
  md: 12,
  lg: 50
}

export const collectionFilterOptions = knownContracts
  .sort((a, b) => (a.name > b.name ? 1 : -1))
  .map((x) => new MarketFilterCollection(x.name, x.address));

export const marketPlaceCollectionFilterOptions = knownContracts
  .filter((c) => c.listable)
  .sort((a, b) => (a.name > b.name ? 1 : -1))
  .map((x) => new MarketFilterCollection(x.name, x.address));

export const listingFilterOptions = [
  {
    key: 'all',
    label: 'All',
  },
  {
    key: 'listed',
    label: 'Listed',
  },
  {
    key: 'unlisted',
    label: 'Unlisted',
  },
];
