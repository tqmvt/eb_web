import {isEmptyObj} from "../../../utils";

export class FullCollectionsQuery {
  address = null;
  token = null;
  listed = null;
  traits = {};
  powertraits = {};
  search = null;
  minPrice = null;
  maxPrice = null;
  minListingTime = null;
  maxListingTime = null;
  minRank = null;
  maxRank = null;

  constructor(json) {
    Object.assign(this, json);
  }

  static default() {
    return new FullCollectionsQuery();
  }

  static createApiQuery(json) {
    return new FullCollectionsQuery(json);
  }

  toApi() {
    const obj = {
      address: this.address,
      token: this.token,
      listed: this.listed,
      traits: this.traits,
      powertraits:  this.powertraits,
      search: this.search,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minListingTime: this.minListingTime,
      maxListingTime: this.maxListingTime,
      minRank: this.minRank,
      maxRank: this.maxRank,
    };

    return Object.fromEntries(Object.entries(obj).filter(([k, v]) => {
      return !!v && !isEmptyObj(v)
    }));
  }
}
