import { createSlice } from '@reduxjs/toolkit';
import { BigNumber, Contract, ethers } from 'ethers';
import { toast } from 'react-toastify';

import { getMyOffers, getReceivedOffers, getOffersForSingleNFT } from '../core/subgraph';
import { createSuccessfulTransactionToastContent } from '../utils';
import { ERC1155, ERC721, MetaPixelsAbi, SouthSideAntsReadAbi } from '../Contracts/Abis';
import { isMetapixelsCollection, isSouthSideAntsCollection } from '../utils';
import config from '../Assets/networks/rpc_config.json';

const knownContracts = config.known_contracts;

const offerSlice = createSlice({
  name: 'offer',
  initialState: {
    error: false,

    // offers list
    madeOffersLoading: false,
    madeOffers: [],

    receivedOffersLoading: false,
    receivedOffers: [],

    offersForSingleNFTLoading: false,
    offersForSingleNFT: [],

    contract: null,
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
  },
});

export const {
  madeOffersLoading,
  madeOffersLoaded,
  receivedOffersLoading,
  receivedOffersLoaded,
  offersForSingleNFTLoading,
  offersForSingleNFTLoaded,
  offerActionSuccess,
  offerActionFailed,
  updateContractInstanceSuccess,
} = offerSlice.actions;

export default offerSlice.reducer;

export const fetchMadeOffers = (address) => async (dispatch) => {
  dispatch(madeOffersLoading());
  const { data } = await getMyOffers(address);

  if (data) dispatch(madeOffersLoaded(data));
};

export const fetchReceivedOffers = (address) => async (dispatch) => {
  dispatch(receivedOffersLoading());
  const { data } = await getReceivedOffers(address);

  if (data) dispatch(receivedOffersLoaded(data));
};

export const fetchOffersForSingleNFT = (nftAddress, nftId) => async (dispatch) => {
  dispatch(offersForSingleNFTLoading());
  const { data } = await getOffersForSingleNFT(nftAddress, nftId);

  if (data) dispatch(offersForSingleNFTLoaded(data));
};

export const updateOfferSuccess = (transactionHash) => async (dispatch) => {
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
