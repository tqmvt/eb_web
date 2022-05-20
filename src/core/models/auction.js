import {millisecondTimestamp} from "../../utils";
import {ethers} from 'ethers';

export class Auction {

  constructor(json) {
    Object.assign(this, json);
  }

  get getAuctionId() {
    return this.index;
  }

  get getAuctionHash() {
    return this.hash;
  }

  get getHighestBid() {
    if (this.highestBid ?? this.highest_bid) {

    } else {
      return ethers.utils.formatEther(this.getHighestBidWei);
    }
  }

  get getHighestBidWei() {
    return this.highestBidWei ?? this.highest_bid_wei ?? 0;
  }

  get getHighestBidder() {
    return this.highestBidder ?? this.highest_bidder ?? 0;
  }

  get getMinimumBid() {
    return this.minimumBid ?? this.minimum_bid ?? 0;
  }

  get getBidHistory() {
    return this.bidHistory ?? this.bid_history ?? [];
  }

  get getEndAt() {
    return millisecondTimestamp(this.endAt ?? this.end_at ?? 0);
  }
}