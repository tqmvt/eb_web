export class CollectionSortOption {
  label = 'None';
  key = null;
  direction = null;

  get getOptionLabel() {
    return this.label;
  }

  get getOptionValue() {
    return this.key;
  }

  static fromJson({ key, direction, label }) {
    const sortOption = new CollectionSortOption();

    sortOption.key = key;
    sortOption.direction = direction;
    sortOption.label = label;

    return sortOption;
  }
  static default() {
    return new CollectionSortOption();
  }

  toApi() {
    return {
      sortBy: this.key || 'id',
      direction: this.direction || 'desc',
    };
  }
}
