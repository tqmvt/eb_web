import {isEmptyObj} from "../../../utils";
import {limitSizeOptions} from "../../../Components/components/constants/filter-options";

export class ListingsQuery {
  listingId = null;
  collection = null;
  tokenId = null;
  seller = null;
  state = null;
  traits = {};
  powertraits = {};
  search = null;
  invalid = null;
  minPrice = null;
  maxPrice = null;
  minListingTime = null;
  maxListingTime = null;
  minSaleTime = null;
  maxSaleTime = null;
  minRank = null;
  maxRank = null;

  constructor(json) {
    Object.assign(this, json);
  }

  static default() {
    return new ListingsQuery();
  }

  static fromCollectionFilter(json) {
    let query = new ListingsQuery(json);

    if (Object.keys(query).includes('address')) {
      query.collection = query.address;
      delete query.address;
    }

    return query;
  }

  static fromMarketFilter(json) {
    let query = new ListingsQuery(json);
    query.collection = json.address;
    delete query.address;

    return query;
  }

  toApi() {
    const obj = {
      listingId: this.listingId,
      collection: this.collection,
      tokenId: this.tokenId,
      seller: this.seller,
      state: this.state,
      traits: this.traits,
      powertraits: this.powertraits,
      search: this.search,
      invalid: this.invalid,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minListingTime: this.minListingTime,
      maxListingTime: this.maxListingTime,
      minSaleTime: this.minSaleTime,
      maxSaleTime: this.maxSaleTime,
      minRank: this.minRank,
      maxRank: this.maxRank,
    };
console.log('toApi', obj)
    return Object.fromEntries(Object.entries(obj).filter(([k, v]) => {
      return !!v && !isEmptyObj(v)
    }));
  }
}
