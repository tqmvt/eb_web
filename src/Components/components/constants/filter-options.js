import { FilterOption } from '../../Models/filter-option.model';
import { ListingsFilterOption } from '../../Models/listings-filter-option.model';
import {appConfig} from "../../../Config";

const knownContracts = appConfig('collections');

export const limitSizeOptions = {
  md: 12,
  lg: 50
}

export const collectionFilterOptions = knownContracts
  .sort((a, b) => (a.name > b.name ? 1 : -1))
  .map((x) => FilterOption.fromJson(x));

export const marketPlaceCollectionFilterOptions = knownContracts
  .filter((c) => c.listable)
  .sort((a, b) => (a.name > b.name ? 1 : -1))
  .map((x) => ListingsFilterOption.fromJson(x));

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
