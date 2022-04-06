import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';
import { getMyOffers, getReceivedOffers } from '../core/subgraph';
import { createSuccessfulTransactionToastContent, sliceIntoChunks } from '../utils';

const offerSlice = createSlice({
  name: 'offer',
  initialState: {
    error: false,

    // offers list
    madeOffersLoading: false,
    madeOffers: [],

    receivedOffersLoading: false,
    receivedOffers: [],
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
    // offer actions
    offerActionSuccess: (state) => {
      state.error = false;
    },
    offerActionFailed: (state, action) => {
      state.error = action.payload;
    },
  },
});

export const {
  madeOffersLoading,
  madeOffersLoaded,
  receivedOffersLoading,
  receivedOffersLoaded,
  offerActionSuccess,
  offerActionFailed,
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
