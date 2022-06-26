import {isEmptyObj} from "../../utils";
import {cleanedQuery} from "../../helpers/query";

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
   * Traits and powertraits need to be explicitly encoded
   *
   * @returns {*}
   */
  toPageQuery() {
    const obj = cleanedQuery({
      token: this.token,
      search: this.search,
      traits: this.traits,
      powertraits: this.powertraits,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      minRank: this.minRank,
      maxRank: this.maxRank,
      listed: this.listed,
      tab: this.tab,
    });

    if (obj.traits) obj.traits = JSON.stringify(obj.traits);
    if (obj.powertraits) obj.powertraits = JSON.stringify(obj.powertraits);

    return obj;
  }

  /**
   * Maps to an object that is acceptable to use as an API query string.
   * Strips out any fields that the API does not support.
   *
   * @returns {*}
   */
  toQuery() {
    return cleanedQuery({
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
    });
  }
}
