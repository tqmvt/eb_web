import {isEmptyObj} from "../../utils";

export class CollectionFilters {
  address = null;
  token = null;
  search = null;
  traits = {};
  powertraits = {};
  minPrice = null;
  maxPrice = null;
  minRank = null;
  maxRank = null;
  listed = null;

  static default() {
    return new CollectionFilters();
  }

  toQuery() {
    const obj = {
      address: this.address,
      token: this.token,
      search: this.search,
      traits: this.traits,
      powertraits:  this.powertraits,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minRank: this.minRank,
      maxRank: this.maxRank,
      listed: this.listed,
    };

    return Object.fromEntries(Object.entries(obj).filter(([k, v]) => {
      return !!v && !isEmptyObj(v)
    }));
  }
}
