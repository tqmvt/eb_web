import { createSlice } from '@reduxjs/toolkit';
import { getMyOffers, getReceivedOffers } from '../core/subgraph';

const offerSlice = createSlice({
  name: 'offer',
  initialState: {
    error: false,

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
  },
});

export const { madeOffersLoading, madeOffersLoaded, receivedOffersLoading, receivedOffersLoaded } = offerSlice.actions;

export default offerSlice.reducer;

export const fetchMadeOffers = (address) => async (dispatch) => {
  dispatch(madeOffersLoading());
  const { data } = await getMyOffers(address);

  if (data) dispatch(madeOffersLoaded(data));
};

export const fetchReceivedOffers = (address) => async (dispatch) => {
  dispatch(receivedOffersLoading());
  const { data } = await getReceivedOffers(address);
  console.log('data', data);

  if (data) dispatch(receivedOffersLoaded(data));
};
