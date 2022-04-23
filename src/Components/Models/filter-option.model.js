export class FilterOption {
  type = 'collection';
  address = null;
  name = 'All';
  id = null;
  slug = '';

  get getOptionLabel() {
    return this.name;
  }

  get getOptionValue() {
    return this.address;
  }

  lowercasedAddress() {
    if (Array.isArray(this.address)) {
      return this.address.map((a) => a.toLowerCase());
    }

    return this.address;
  }

  static fromJson({ address, name, id = null }) {
    const filterOption = new FilterOption();

    filterOption.address = address;
    filterOption.name = name;
    filterOption.id = id;

    return filterOption;
  }

  static default() {
    return new FilterOption();
  }

  toApi() {
    if (!this.address || !this.type) {
      return {};
    }

    if (this.slug) {
      return {
        slug: this.slug,
      };
    }

    if (this.address && this.id) {
      return {
        address: this.lowercasedAddress(),
        token: this.id,
      };
    }

    return {
      address: this.lowercasedAddress(),
    };
  }
}
