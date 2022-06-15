import { createSlice } from '@reduxjs/toolkit';
import { getLeaders } from '../core/api';

const leaderBoardSlice = createSlice({
  name: 'leaderBoard',
  initialState: {
    loading: false,
    error: false,
    totalVolume: [],
    buyVolume: [],
    sellVolume: [],
    biggestSingleSale: [],
  },
  reducers: {
    leaderBoardLoading: (state) => {
      state.loading = true;
    },
    leaderBoardReceived: (state, action) => {
      state.loading = false;
      state.totalVolume = action.payload[0].data.map((data) => ({
        address: data.id,
        salesVolume: data.sellVolume,
        buyVolume: data.buyVolume,
        totalVolume: data.totalVolume,
      }));
      state.sellVolume = action.payload[1].data.map((data) => ({
        address: data.id,
        numberOfSales: data.numberSales,
        totalVolume: data.sellVolume,
      }));
      state.buyVolume = action.payload[2].data.map((data) => ({
        address: data.id,
        numberOfBuy: data.numberBuys,
        totalVolume: data.buyVolume,
      }));
      state.biggestSingleSale = action.payload[3].data.map((data) => ({
        address: data.id,
        transactions: '',
        totalVolume: data.sellVolume,
      }));
    },
  },
});

export const { leaderBoardLoading, leaderBoardReceived } = leaderBoardSlice.actions;

export default leaderBoardSlice.reducer;

export const getAllLeaderBoard = (timeframe) => async (dispatch, state) => {
  try {
    dispatch(leaderBoardLoading());
    const responses = await getLeaders(timeframe);
    dispatch(leaderBoardReceived(responses));
  } catch (error) {
    console.log(error);
  }
};
