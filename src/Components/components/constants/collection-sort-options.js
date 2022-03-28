import { CollectionSortOption } from '../../Models/collection-sort-option.model';

const sort = [
  {
    key: 'id',
    direction: 'desc',
    label: 'Latest Listings',
  },
  {
    key: 'price',
    direction: 'desc',
    label: 'Price (Highest)',
  },
  {
    key: 'price',
    direction: 'asc',
    label: 'Price (Lowest)',
  },
  {
    key: 'rank',
    direction: 'asc',
    label: 'Rank (Highest)',
  },
  {
    key: 'rank',
    direction: 'desc',
    label: 'Rank (Lowest)',
  },
];

export const sortOptions = sort.map((x) => CollectionSortOption.fromJson(x));
