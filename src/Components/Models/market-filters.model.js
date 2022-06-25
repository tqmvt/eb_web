import {isEmptyObj} from "../../utils";
import {limitSizeOptions} from "../components/constants/filter-options";

export class MarketFilters {
  collection = MarketFilterCollection.default();
  search = null;
  limit = limitSizeOptions.lg;
  seller = null;
  tokenId = null;

  static default() {
    return new MarketFilters();
  }

  /**
   * Maps to an object that is acceptable to use as a URL query string.
   * Includes values such as current tab
   *
   * @returns {*}
   */
  toQuery() {
    const obj = {
      address: this.collection.value,
      seller: this.seller,
      search: this.search,
      limit: this.limit,
      tokenId: this.tokenId,
    };

    return Object.fromEntries(Object.entries(obj).filter(([k, v]) => {
      return !!v && !isEmptyObj(v)
    }));
  }
}

export class MarketFilterCollection {
  label = 'All';
  value = null;

  constructor(label, value) {
    this.label = label ?? 'All';
    this.value = value;
  }

  static default() {
    return new MarketFilterCollection();
  }
}