import {millisecondTimestamp} from "../../utils";

export class Auction {

  constructor(json) {
    Object.assign(this, json);
  }

  get getAuctionId() {
    return this.index;
  }

  get getHighestBid() {
    return this.highestBid ?? this.highest_bid ?? 0;
  }

  get getMinimumBid() {
    return this.minimumBid ?? this.minimum_bid ?? 0;
  }

  get getEndAt() {
    return millisecondTimestamp(this.endAt ?? this.end_at ?? 0);
  }
}