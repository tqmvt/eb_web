import { createSlice } from '@reduxjs/toolkit';
import { Contract, ethers } from 'ethers';
import Membership from '../Contracts/EbisusBayMembership.json';
import {appConfig} from "../Config";

const config = appConfig();
const readProvider = new ethers.providers.JsonRpcProvider(config.rpc.read);
const readMemberships = new Contract(config.contracts.membership, Membership.abi, readProvider);

const memberSlice = createSlice({
  name: 'memberships',
  initialState: {
    founders: {
      id: 1,
      price: '',
      discount: '',
      count: 0,
      max: 10000,
      maxMint: 10,
      fetching: true,
    },
    vips: {
      id: 2,
      price: '',
      discount: '',
      count: 0,
      max: 1000,
      maxMint: 10,
    },
  },
  reducers: {
    foundersReceived(state, action) {
      state.founders = action.payload;
    },
    vipsReceived(state, action) {
      state.vips = action.payload;
    },
  },
});

const { foundersReceived, vipsReceived } = memberSlice.actions;
export const memberships = memberSlice.reducer;

export const fetchMemberInfo = () => async (dispatch) => {
  const nc = await readMemberships.founderCount();
  const p = await readMemberships.founderPrice();
  const d = await readMemberships.founderReferralDiscount();

  dispatch(
    foundersReceived({
      id: 1,
      price: ethers.utils.formatEther(p),
      discount: ethers.utils.formatEther(d),
      count: nc.toNumber(),
      max: 10000,
      maxMint: 10,
      fetching: false,
    })
  );
};

export const fetchVipInfo = () => async (dispatch) => {
  const nc = await readMemberships.vipCount();
  const p = await readMemberships.vipPrice();
  const d = await readMemberships.vipReferralDiscount();
  dispatch(
    vipsReceived({
      id: 2,
      price: ethers.utils.formatEther(p),
      discount: ethers.utils.formatEther(d),
      count: nc.toNumber(),
      max: 1000,
      maxMint: 10,
    })
  );
};
