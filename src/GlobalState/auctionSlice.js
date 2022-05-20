import { createSlice } from '@reduxjs/toolkit';
import { getAuction, getNft } from '../core/api';
import { Contract, ethers } from 'ethers';
import config from '../Assets/networks/rpc_config.json';
import {Auction} from "../core/models/auction";
import AuctionContract from '../Contracts/DegenAuction.json';
const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);

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
      state.bidHistory = action.payload.listing.getBidHistory ?? [];
      state.powertraits = action.payload.powertraits ?? [];
      state.minBid = action.payload.minBid;
    },
    auctionUpdated: (state, action) => {
      state.listing = action.payload.listing;
    },
  },
});

export const { auctionLoading, auctionReceived, auctionUpdated } = auctionSlice.actions;

export default auctionSlice.reducer;

export const getAuctionDetails = (auctionId) => async (dispatch) => {
  dispatch(auctionLoading());
  const [ hash, index ] = auctionId.split('-');

  const auctionJson = await getAuction(hash, index);
  const listing = new Auction(auctionJson);
  const nft = await getNft(listing.nftAddress, listing.nftId, false);
  const history = nft?.listings ?? [];
  const powertraits = nft.nft?.powertraits ?? [];

  let minBid;
  try {
    const readContract = new Contract(config.mm_auction_contract, AuctionContract.abi, readProvider);
    minBid = await readContract.minimumBid(hash, index);
    minBid = ethers.utils.formatEther(minBid);
  } catch (error) {
    minBid = listing.getMinimumBid;
    console.log('Failed to retrieve minimum bid. Falling back to api value', error);
  }
  dispatch(auctionReceived({ listing, history, powertraits, minBid }));
};
