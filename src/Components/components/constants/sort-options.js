import { SortOption } from '../../Models/sort-option.model';

const sort = [
  {
    key: 'listingId',
    direction: 'desc',
    label: 'Latest Listings',
  },
  {
    key: 'price',
    direction: 'desc',
    label: 'Price (High to Low)',
  },
  {
    key: 'price',
    direction: 'asc',
    label: 'Price (Low to High)',
  },
  {
    key: 'rank',
    direction: 'asc',
    label: 'Rank (High to Low)',
  },
  {
    key: 'rank',
    direction: 'desc',
    label: 'Rank (Low to High)',
  },
];

export const sortOptions = sort.map((x) => SortOption.fromJson(x));
