import { createSlice } from '@reduxjs/toolkit';
import { Contract } from 'ethers';
import { toast } from 'react-toastify';

import { getQuickWallet } from '../core/api';
import {
  getAllOffers,
  getMyOffers,
  getReceivedOffers,
  getFilteredOffers,
  getOffersForSingleNFT,
} from '../core/subgraph';
import { createSuccessfulTransactionToastContent } from '../utils';
import { ERC1155, ERC721, MetaPixelsAbi, SouthSideAntsReadAbi } from '../Contracts/Abis';
import { isMetapixelsCollection, isSouthSideAntsCollection } from '../utils';
import config from '../Assets/networks/rpc_config.json';

const knownContracts = config.known_contracts;

const offerSlice = createSlice({
  name: 'offer',
  initialState: {
    error: false,

    // made offers list
    madeOffersLoading: false,
    madeOffers: [],

    // todo: remove
    receivedOffersLoading: false,
    receivedOffers: [],

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
    madeOffersLoading: (state) => {
      state.madeOffersLoading = true;
      state.error = false;
    },
    madeOffersLoaded: (state, action) => {
      state.madeOffersLoading = false;
      state.error = false;
      state.madeOffers = action.payload;
    },
    receivedOffersLoading: (state) => {
      state.receivedOffersLoading = true;
      state.error = false;
    },
    receivedOffersLoaded: (state, action) => {
      state.receivedOffersLoading = false;
      state.error = false;
      state.receivedOffers = action.payload;
    },
    allOffersLoading: (state) => {
      state.allOffersLoading = true;
      state.error = false;
    },
    allOffersLoaded: (state, action) => {
      state.allOffersLoading = false;
      state.error = false;
      state.allOffers = action.payload;
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
    offerActionSuccess: (state) => {
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
  madeOffersLoading,
  madeOffersLoaded,
  receivedOffersLoading,
  receivedOffersLoaded,
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

export const fetchAllOffers = (addresses) => async (dispatch) => {
  dispatch(allOffersLoading());
  const { data } = await getAllOffers(addresses);

  if (data) dispatch(allOffersLoaded(data));
  else dispatch(allOffersLoaded([]));
};

export const fetchMadeOffers = (address) => async (dispatch) => {
  dispatch(madeOffersLoading());
  const { data } = await getMyOffers(address);

  if (data) dispatch(madeOffersLoaded(data));
  else dispatch(madeOffersLoaded([]));
};

export const fetchMyNFTs = (address) => async (dispatch) => {
  dispatch(myNFTsLoading());
  const { data } = await getQuickWallet(address);

  if (data) dispatch(myNFTsLoaded(data));
  else dispatch(myNFTsLoaded([]));
};

export const fetchReceivedOffers = (address) => async (dispatch) => {
  dispatch(receivedOffersLoading());
  const { data } = await getReceivedOffers(address);

  if (data) dispatch(receivedOffersLoaded(data));
  else dispatch(receivedOffersLoaded([]));
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

  if (data) dispatch(offersForSingleNFTLoaded(data));
  else dispatch(offersForSingleNFTLoaded([]));
};

export const updateOfferSuccess = (transactionHash, walletAddress) => async (dispatch) => {
  if (walletAddress) {
    dispatch(fetchMadeOffers(walletAddress));
    dispatch(fetchMyNFTs(walletAddress));
  }

  dispatch(offerActionSuccess());
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