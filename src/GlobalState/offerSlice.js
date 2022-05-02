import { createSlice } from '@reduxjs/toolkit';
import { Contract } from 'ethers';
import { toast } from 'react-toastify';

import { getQuickWallet } from '../core/api';
import { getAllOffers, getMyOffers, getFilteredOffers, getOffersForSingleNFT } from '../core/subgraph';
import { createSuccessfulTransactionToastContent } from '../utils';
import { ERC1155, ERC721, MetaPixelsAbi } from '../Contracts/Abis';
import { isMetapixelsCollection } from '../utils';
import config from '../Assets/networks/rpc_config.json';
import {offerState} from "../core/api/enums";

const knownContracts = config.known_contracts;

const offerSlice = createSlice({
  name: 'offer',
  initialState: {
    error: false,
    lastId: '',

    // made offers list
    madeOffersLoading: false,
    madeOffers: [],

    // all offers for received offers
    allOffersLoading: false,
    allOffers: [],

    // offers list for an nft
    offersForSingleNFTLoading: false,
    offersForSingleNFT: [],

    contract: null,

    // my nfts for received offers
    myNFTs: [],
    myNFTsLoading: false,

    // filtered offers
    filteredOffers: [],
    filteredOffersLoading: false,
  },
  reducers: {
    initOffers: (state) => {
      state.lastId = '';
      state.madeOffers = [];
      state.allOffers = [];
    },
    madeOffersLoading: (state) => {
      state.madeOffersLoading = true;
      state.error = false;
    },
    madeOffersLoaded: (state, action) => {
      state.madeOffersLoading = false;
      state.error = false;
      state.madeOffers = action.payload.madeOffers;
      state.lastId = action.payload.lastId;
    },
    allOffersLoading: (state) => {
      state.allOffersLoading = true;
      state.error = false;
    },
    allOffersLoaded: (state, action) => {
      state.allOffersLoading = false;
      state.error = false;
      state.allOffers = action.payload.allOffers;
      state.lastId = action.payload.lastId;
    },
    offersForSingleNFTLoading: (state) => {
      state.offersForSingleNFTLoading = true;
      state.error = false;
    },
    offersForSingleNFTLoaded: (state, action) => {
      state.offersForSingleNFTLoading = false;
      state.error = false;
      state.offersForSingleNFT = action.payload;
    },
    // offer actions
    offerActionSuccess: (state, action) => {
      state.madeOffers = action.payload.madeOffers;
      state.allOffers = action.payload.allOffers;
      state.error = false;
    },
    offerActionFailed: (state, action) => {
      state.error = action.payload;
    },
    // update nft contract instance
    updateContractInstanceSuccess: (state, action) => {
      state.contract = action.payload;
    },
    // get my nfts
    myNFTsLoading: (state) => {
      state.myNFTsLoading = true;
      state.error = false;
    },
    myNFTsLoaded: (state, action) => {
      state.myNFTsLoading = false;
      state.error = false;
      state.myNFTs = action.payload;
    },
    filteredOffersLoading: (state) => {
      state.filteredOffersLoading = true;
      state.error = false;
    },
    filteredOffersLoaded: (state, action) => {
      state.filteredOffersLoading = false;
      state.error = false;
      state.filteredOffers = action.payload;
    },
  },
});

export const {
  initOffers,
  madeOffersLoading,
  madeOffersLoaded,
  filteredOffersLoading,
  filteredOffersLoaded,
  myNFTsLoading,
  myNFTsLoaded,
  allOffersLoading,
  allOffersLoaded,
  offersForSingleNFTLoading,
  offersForSingleNFTLoaded,
  offerActionSuccess,
  offerActionFailed,
  updateContractInstanceSuccess,
} = offerSlice.actions;

export default offerSlice.reducer;

export const fetchAllOffers =
  (addresses, stateFilter = '0') =>
  async (dispatch, getState) => {
    if (!addresses.length) return;
    dispatch(allOffersLoading());
    const { data } = await getAllOffers(addresses, stateFilter);

    if (data) {
      dispatch(allOffersLoaded({ allOffers: data }));
    } else dispatch(allOffersLoaded([]));
  };

export const fetchMadeOffers =
  (address, stateFilter = '0') =>
  async (dispatch, getState) => {
    dispatch(madeOffersLoading());
    const { data } = await getMyOffers(address, stateFilter);

    if (data) {
      dispatch(madeOffersLoaded({ madeOffers: data }));
    } else dispatch(madeOffersLoaded([]));
  };

export const fetchMyNFTs = (address) => async (dispatch) => {
  dispatch(myNFTsLoading());
  const { data } = await getQuickWallet(address);

  if (data) dispatch(myNFTsLoaded(data));
  else dispatch(myNFTsLoaded([]));
};

export const fetchFilteredOffers = (nftAddress, nftId, walletAddress) => async (dispatch) => {
  dispatch(filteredOffersLoading());
  const { data } = await getFilteredOffers(nftAddress, nftId, walletAddress);

  if (data) dispatch(filteredOffersLoaded(data));
  else dispatch(filteredOffersLoaded([]));
};

export const fetchOffersForSingleNFT = (nftAddress, nftId) => async (dispatch) => {
  dispatch(offersForSingleNFTLoading());
  const { data } = await getOffersForSingleNFT(nftAddress, nftId);

  if (data) {
    const activeOffers = data.filter((offer) => offer.state.toString() === offerState.ACTIVE.toString());
    dispatch(offersForSingleNFTLoaded(activeOffers));
  }
  else dispatch(offersForSingleNFTLoaded([]));
};

export const updateOfferSuccess = (transactionHash, updatedOffer) => async (dispatch, getState) => {
  const state = getState();

  let madeOffers = [...state.offer.madeOffers];
  let allOffers = [...state.offer.allOffers];

  const madeOfferIndex = madeOffers.findIndex(
    (offer) => offer.nftAddress === updatedOffer.nftAddress && offer.nftId === updatedOffer.nftId
  );

  const allOfferIndex = allOffers.findIndex(
    (offer) => offer.nftAddress === updatedOffer.nftAddress && offer.nftId === updatedOffer.nftId
  );

  if (madeOfferIndex !== -1) {
    madeOffers[madeOfferIndex] = updatedOffer;
  }

  if (allOfferIndex !== -1) {
    allOffers[allOfferIndex] = updatedOffer;
  }

  dispatch(offerActionSuccess({ madeOffers, allOffers }));
  toast.success(createSuccessfulTransactionToastContent(transactionHash));
};

export const updateOfferFailed = (error) => async (dispatch) => {
  dispatch(offerActionFailed());
  if (error.data) {
    toast.error(error.data.message);
  } else if (error.message) {
    toast.error(error.message);
  } else {
    console.log(error);
    toast.error('Unknown Error');
  }
};

export const updateContractInstance = (walletProvider, nftAddress) => async (dispatch) => {
  const signer = walletProvider.getSigner();
  let nftInfo = knownContracts.find((c) => c.address.toLowerCase() === nftAddress.toLowerCase());

  let contractInstance;
  // ERC 1155
  if (nftInfo && nftInfo.multiToken) {
    contractInstance = new Contract(nftAddress, ERC1155, signer);
  }
  if (isMetapixelsCollection(nftAddress)) {
    contractInstance = new Contract(nftAddress, MetaPixelsAbi, signer);
  }

  // ERC 721
  contractInstance = new Contract(nftAddress, ERC721, signer);

  dispatch(updateContractInstanceSuccess(contractInstance));
};
