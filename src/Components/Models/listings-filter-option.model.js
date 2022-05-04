import { FilterOption } from './filter-option.model';

export class ListingsFilterOption extends FilterOption {
  type = 'collection';
  address = null;
  name = 'All';
  id = null;

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
    const filterOption = new ListingsFilterOption();

    filterOption.address = address;
    filterOption.name = name;
    filterOption.id = id;

    return filterOption;
  }

  static default() {
    return new ListingsFilterOption();
  }

  toApi() {
    if (!this.address || !this.type) {
      return {};
    }

    if (this.address && this.id) {
      return {
        address: this.lowercasedAddress(),
        tokenId: this.id,
      };
    }

    if (this.address && this.type === 'seller') {
      return {
        seller: this.lowercasedAddress(),
      };
    }

    return {
      address: this.lowercasedAddress(),
    };
  }
}
