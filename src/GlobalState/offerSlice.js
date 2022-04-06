import { createSlice } from '@reduxjs/toolkit';
import { getMyOffers } from '../core/subgraph';

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
  },
});

export const { madeOffersLoading, madeOffersLoaded } = offerSlice.actions;

export default offerSlice.reducer;

export const fetchMadeOffers = (address) => async (dispatch) => {
  dispatch(madeOffersLoading());
  const { data } = await getMyOffers(address);
  console.log('data', data);

  if (data) dispatch(madeOffersLoaded(data));
};
