import { createSlice } from '@reduxjs/toolkit';

const metaverseSlice = createSlice({
  name: 'metaverse',
  initialState: {
    bidDialogVisible: false,
    auctionId: -1,
  },
  reducers: {
    showBidDialog: (state, action) => {
      state.auctionId = action.payload.auctionId
      state.bidDialogVisible = true;
    },
    hideBidDialog: (state) => {
      state.bidDialogVisible = false;
    },
  },
});

export const { showBidDialog, hideBidDialog } = metaverseSlice.actions;

export default metaverseSlice.reducer;
