import { createSlice } from '@reduxjs/toolkit';
import { getAuction, getNft } from '../core/api';
import { Contract, ethers } from 'ethers';
import { Auction } from '../core/models/auction';
import AuctionContract from '../Contracts/DegenAuction.json';
import { devLog } from '../utils';
import {appConfig} from "../Config";

const config = appConfig();
const readProvider = new ethers.providers.JsonRpcProvider(config.rpc.read);

const auctionSlice = createSlice({
  name: 'listing',
  initialState: {
    loading: false,
    error: false,
    auction: null,
    nft: null,
    history: [],
    bidHistory: [],
    powertraits: [],
    minBid: null,
  },
  reducers: {
    auctionLoading: (state) => {
      state.loading = true;
    },
    auctionReceived: (state, action) => {
      state.loading = false;
      state.auction = action.payload.listing;
      state.history = action.payload.history ?? [];
      state.bidHistory = action.payload.bidHistory ?? [];
      state.powertraits = action.payload.powertraits ?? [];
      state.minBid = action.payload.minBid;
    },
    auctionUpdated: (state, action) => {
      state.listing = action.payload.listing;
    },
    newBidMade: (state, action) => {
      state.auction = action.payload.auction;
      state.bidHistory = action.payload.bidHistory;
      state.minBid = action.payload.minBid;
    },
  },
});

export const { auctionLoading, auctionReceived, auctionUpdated, newBidMade } = auctionSlice.actions;

export default auctionSlice.reducer;

export const getAuctionDetails = (auctionId) => async (dispatch) => {
  dispatch(auctionLoading());
  const [hash, index] = auctionId.split('-');

  const auctionJson = await getAuction(hash, index);
  const listing = new Auction(auctionJson);
  const nft = await getNft(listing.nftAddress, listing.nftId, false);
  const history = nft?.listings ?? [];
  const powertraits = nft.nft?.powertraits ?? [];
  const flattenedBidHistory = listing.getBidHistory.flatMap((item) => item.updates.map((o) => {
    return {...o, bidder: item.bidder};
  })).sort((a, b) => parseInt(a.price) < parseInt(b.price) ? 1 : -1);

  let minBid;
  try {
    const readContract = new Contract(config.contracts.madAuction, AuctionContract.abi, readProvider);
    minBid = await readContract.minimumBid(hash, index);
    minBid = ethers.utils.formatEther(minBid);
  } catch (error) {
    minBid = listing.getMinimumBid;
    console.log('Failed to retrieve minimum bid. Falling back to api value', error);
  }
  dispatch(auctionReceived({ listing, history, powertraits, minBid, bidHistory: flattenedBidHistory }));
};

export const updateAuctionFromBidEvent = (bidAmount) => async (dispatch, getState) => {
  const state = getState();
  const currentAuction = state.auction.auction;

  devLog('updateAuctionFromBidEvent', currentAuction.hash, currentAuction.index);
  try {
    const readContract = new Contract(config.contracts.madAuction, AuctionContract.abi, readProvider);
    const chainAuction = await readContract.getAuction(currentAuction.hash, currentAuction.index);
    const minBid = await readContract.minimumBid(currentAuction.hash, currentAuction.index);
    devLog('minBid', minBid.toString());
    devLog('chainAuction', chainAuction, parseInt(chainAuction.endAt));

    const allBids = await readContract.getAllBids(currentAuction.hash, currentAuction.index);
    const apiMappedAllBids = allBids.map((bid) => {
      return {
        bidder: bid.bidder,
        created: bid.created.toString(),
        withdrawn: bid.hasWithdrawn,
        price: ethers.utils.formatEther(bid.value),
        price_wei: bid.value.toString(),
      };
    });
    const sortedBids = apiMappedAllBids.sort((a, b) => (parseInt(a.price) < parseInt(b.price) ? 1 : -1));
    const highestBid = sortedBids[0];

    devLog('allBids', allBids, apiMappedAllBids);
    devLog('highestBid', highestBid.price);
    const auction = new Auction({
      ...state.auction.auction,
      ...{
        highestBid: highestBid.price,
        highestBidWei: ethers.utils.parseEther(highestBid.price).toString(),
        highestBidder: highestBid.bidder,
        minimumBid: minBid.toString(),
        bidHistory: apiMappedAllBids,
        endAt: parseInt(chainAuction.endAt)
    }});
    devLog('auction', state.auction.auction, auction);

    dispatch(
      newBidMade({
        auction,
        minBid: ethers.utils.formatEther(minBid),
        bidHistory: apiMappedAllBids,
      })
    );
  } catch (error) {
    console.log('Failed to retrieve minimum bid. Falling back to api value', error);
  }
};
