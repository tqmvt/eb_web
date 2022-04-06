import { createSlice } from '@reduxjs/toolkit';
import { getNft } from '../core/api';

const nftSlice = createSlice({
  name: 'nft',
  initialState: {
    loading: false,
    error: false,
    nft: null,
    history: [],
    powertraits: [],
  },
  reducers: {
    nftLoading: (state) => {
      state.loading = true;
      state.error = false;
    },
    nftReceived: (state, action) => {
      state.loading = false;
      state.error = false;
      state.nft = action.payload.nft;
      state.history = action.payload.listings ?? [];
      state.powertraits = action.payload.powertraits ?? [];
    },
  },
});

export const { nftLoading, nftReceived } = nftSlice.actions;

export default nftSlice.reducer;

export const getNftDetails = (collectionAddress, nftId) => async (dispatch, getState) => {
  dispatch(nftLoading());
  let nft = await getNft(collectionAddress, nftId);
  nft.nft = { ...nft.nft, address: collectionAddress, id: nftId };

  dispatch(nftReceived(nft));
};
