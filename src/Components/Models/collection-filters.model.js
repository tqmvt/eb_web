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
  tab = null;

  /**
   * Map any json object.
   * Object.assign does not do nested mapping by default.
   * Easiest to manually map traits and powertraits for now.
   *
   * @param json
   */
  constructor(json) {
    Object.assign(this, json);
    if (json?.traits) {
      this.traits = JSON.parse(json.traits);
    }
    if (json?.powertraits) {
      this.powertraits = JSON.parse(json.powertraits);
    }
  }

  static default() {
    return new CollectionFilters();
  }

  /**
   * Create an instance from a URL query string object
   *
   * @param query
   * @returns {CollectionFilters}
   */
  static fromQuery(query) {
    return new CollectionFilters(query);
  }

  /**
   * Maps to an object that is acceptable to use as a URL query string.
   * Includes values such as current tab
   *
   * @returns {*}
   */
  toPageQuery() {
    const obj = {
      token: this.token,
      search: this.search,
      traits: this.traits,
      powertraits:  this.powertraits,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minRank: this.minRank,
      maxRank: this.maxRank,
      listed: this.listed,
      tab: this.tab,
    };

    return this.removeEmpties(obj);
  }

  /**
   * Maps to an object that is acceptable to use as an API query string.
   * Strips out any fields that the API does not support.
   *
   * @returns {*}
   */
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

    return this.removeEmpties(obj);
  }

  removeEmpties(obj) {
    return Object.fromEntries(Object.entries(obj).filter(([k, v]) => {
      return !!v && !isEmptyObj(v)
    }));
  }
}
