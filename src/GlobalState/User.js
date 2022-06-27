import { createSlice } from '@reduxjs/toolkit';
import { Contract, ethers, BigNumber } from 'ethers';
import Membership from '../Contracts/EbisusBayMembership.json';
import StakeABI from '../Contracts/Stake.json';
import Market from '../Contracts/Marketplace.json';
import Auction from '../Contracts/DegenAuction.json';
import Offer from '../Contracts/Offer.json';
import Web3Modal from 'web3modal';

import detectEthereumProvider from '@metamask/detect-provider';
import { DeFiWeb3Connector } from 'deficonnect';
import WalletConnectProvider from '@walletconnect/web3-provider';
import * as DefiWalletConnectProvider from '@deficonnect/web3-provider';
import {
  getNftRankings,
  getNftSalesForAddress,
  getNftsForAddress,
  getNftsForAddress2,
  getUnfilteredListingsForAddress,
} from '../core/api';
import { toast } from 'react-toastify';
import {
  caseInsensitiveCompare,
  createSuccessfulTransactionToastContent,
  findCollectionByAddress,
  isUserBlacklisted,
  sliceIntoChunks,
} from '../utils';
import { nanoid } from 'nanoid';
import { appAuthInitFinished } from './InitSlice';
import { captureException } from '@sentry/react';
import { setThemeInStorage } from '../helpers/storage';
import { getAllOffers } from '../core/subgraph';
import { offerState } from '../core/api/enums';
import { CNS, TextRecords } from '@cnsdomains/core';
import { txExtras } from '../core/constants';
import {appConfig} from "../Config";
import {MarketFilterCollection} from "../Components/Models/market-filters.model";

const config = appConfig();

const userSlice = createSlice({
  name: 'user',
  initialState: {
    // Wallet
    provider: null,
    address: null,
    web3modal: null,
    connectingWallet: false,
    gettingContractData: true,
    code: '',
    isMember: false,
    founderCount: 0,
    vipCount: 0,
    stakeCount: 0,
    needsOnboard: false,
    isStaking: false,

    // Contracts
    membershipContract: null,
    marketContract: null,
    stateContract: null,
    auctionContract: null,
    offerContract: null,
    cnsContract: null,

    correctChain: false,
    showWrongChainModal: false,

    // Primary Balances
    balance: null,
    rewards: null,
    marketBalance: null,
    withdrawingMarketBalance: false,
    stakingRewards: null,
    harvestingStakingRewards: false,

    // My NFTs
    fetchingNfts: false,
    nftsInitialized: false,
    nfts: [],
    nftsFullyFetched: false,
    myNftPageTransferDialog: null,
    myNftPageListDialog: null,
    myNftPageCancelDialog: null,
    myNftPageListedOnly: false,
    myNftPageActiveFilterOption: MarketFilterCollection.default(),

    // My Listings
    myUnfilteredListingsFetching: false,
    myUnfilteredListings: [],
    myUnfilteredListingsInvalidOnly: false,
    myUnfilteredListingsCurPage: 0,
    myUnfilteredListingsTotalPages: 0,

    // My Sales
    mySoldNftsFetching: false,
    mySoldNfts: [],
    mySoldNftsCurPage: 0,
    mySoldNftsTotalPages: 0,

    // Offers
    hasOutstandingOffers: false,

    // Theme
    theme: 'dark',

    cnsProfile: {},
  },
  reducers: {
    accountChanged(state, action) {
      state.membershipContract = action.payload.membershipContract;
      state.stakeContract = action.payload.stakeContract;

      state.balance = action.payload.balance;
      state.code = action.payload.code;
      state.rewards = action.payload.rewards;
      state.isMember = action.payload.isMember;
      state.vipCount = action.payload.vipCount;
      state.stakeCount = action.payload.stakeCount;
      state.marketContract = action.payload.marketContract;
      state.marketBalance = action.payload.marketBalance;
      state.stakingRewards = action.payload.stakingRewards;
      state.auctionContract = action.payload.auctionContract;
      state.offerContract = action.payload.offerContract;
      state.gettingContractData = false;
    },

    onCorrectChain(state, action) {
      state.correctChain = action.payload.correctChain;
    },

    onProvider(state, action) {
      state.provider = action.payload.provider;
      state.needsOnboard = action.payload.needsOnboard;
      state.membershipContract = action.payload.membershipContract;
      state.correctChain = action.payload.correctChain;
    },

    onBasicAccountData(state, action) {
      state.address = action.payload.address;
      state.provider = action.payload.provider;
      state.web3modal = action.payload.web3modal;
      state.correctChain = action.payload.correctChain;
      state.needsOnboard = action.payload.needsOnboard;
    },

    fetchingNfts(state, action) {
      state.fetchingNfts = true;
      if (!action.payload?.persist) {
        state.nfts = [];
      }
    },
    onNftsAdded(state, action) {
      state.nfts.push(...action.payload);
    },
    onNftsReplace(state, action) {
      state.nfts = action.payload;
    },
    nftsFetched(state, action) {
      state.fetchingNfts = false;
      state.nftsInitialized = true;
      if (action.payload) {
        state.nfts = action.payload;
      }
    },
    nftsFullyFetched(state) {
      state.fetchingNfts = false;
      state.nftsFullyFetched = true;
    },
    setMyNftPageTransferDialog(state, action) {
      state.myNftPageTransferDialog = action.payload;
    },
    setMyNftPageListDialog(state, action) {
      state.myNftPageListDialog = action.payload;
    },
    setMyNftPageCancelDialog(state, action) {
      state.myNftPageCancelDialog = action.payload;
    },
    setMyNftPageListedOnly(state, action) {
      state.myNftPageListedOnly = action.payload;
    },
    setMyNftPageActiveFilterOption(state, action) {
      state.myNftPageActiveFilterOption = action.payload;
    },
    onNftLoading(state, action) {
      state.currentNft = null;
    },
    onNftLoaded(state, action) {
      state.currentNft = action.payload.nft;
    },
    mySoldNftsFetching(state, action) {
      state.mySoldNftsFetching = true;
    },
    mySalesFetched(state, action) {
      state.mySoldNftsFetching = false;
      state.mySoldNfts.push(...action.payload.listings);
      state.mySoldNftsCurPage = action.payload.page;
      state.mySoldNftsTotalPages = action.payload.totalPages;
    },
    clearMySales(state) {
      state.mySoldNfts = [];
      state.mySoldNftsCurPage = 0;
      state.mySoldNftsTotalPages = 0;
    },
    myUnfilteredListingsFetching(state, action) {
      state.myUnfilteredListingsFetching = true;
    },
    myUnfilteredListingsFetched(state, action) {
      state.myUnfilteredListingsFetching = false;
      state.myUnfilteredListings.push(...action.payload.listings);
      state.myUnfilteredListingsCurPage = action.payload.page;
      state.myUnfilteredListingsTotalPages = action.payload.totalPages;
    },
    myUnfilteredListingsInvalidOnly(state, action) {
      state.myUnfilteredListingsInvalidOnly = action.payload;
    },
    clearMyUnfilteredListings(state) {
      state.myUnfilteredListings = [];
      state.myUnfilteredListingsCurPage = 0;
      state.myUnfilteredListingsTotalPages = 0;
    },
    listingUpdate(state, action) {
      const nftUpdate = (nft, index, key) => {
        const sameAddress = nft.contract.address.toLowerCase() === action.payload.contract.toLowerCase();
        const sameId = nft.id === action.payload.id;
        if (sameAddress && sameId) {
          try {
            state[key][index].listed = action.payload.listed;

            if (action.payload.newPrice !== null) {
              state[key][index].price = action.payload.newPrice;
            }
          } catch (error) {
            console.log(error);
          }
        }
      };
      state.nfts.forEach((nft, index) => nftUpdate(nft, index, 'nfts'));
      state.myUnfilteredListings.forEach((nft, index) => nftUpdate(nft, index, 'myUnfilteredListings'));
    },
    connectingWallet(state, action) {
      state.connectingWallet = action.payload.connecting;
    },
    registeredCode(state, action) {
      state.code = action.payload;
    },
    withdrewRewards(state) {
      state.rewards = 0;
    },
    withdrawingMarketBalance(state) {
      state.withdrawingMarketBalance = true;
    },
    withdrewMarketBalance(state, action) {
      state.withdrawingMarketBalance = false;
      if (action.payload.success) {
        state.marketBalance = 0;
      }
    },
    harvestingStakingRewards(state) {
      state.harvestingStakingRewards = true;
    },
    harvestedStakingRewards(state, action) {
      state.harvestingStakingRewards = false;
      if (action.payload.success) {
        state.stakingRewards = 0;
      }
    },
    transferedNFT(state, action) {
      const indexesToRemove = state.nfts
        .map((nft, index) => {
          const sameId = ethers.BigNumber.from(nft.id).eq(action.payload.id);
          const sameAddress = nft.address.toLowerCase() === action.payload.address.toLowerCase();
          return sameId && sameAddress ? index : null;
        })
        .filter((x) => x !== null)
        .reverse();

      indexesToRemove.forEach((index) => {
        state.nfts.splice(index, 1);
      });
    },
    setIsMember(state, action) {
      state.isMember = action.payload;
    },
    setShowWrongChainModal(state, action) {
      state.showWrongChainModal = action.payload;
    },
    onLogout(state) {
      state.connectingWallet = false;
      const web3Modal = new Web3Modal({
        cacheProvider: false, // optional
        providerOptions: [], // required
      });
      web3Modal.clearCachedProvider();
      if (state.web3modal != null) {
        state.web3modal.clearCachedProvider();
      }
      state.web3modal = null;
      state.provider = null;
      localStorage.clear();
      state.address = '';
      state.balance = null;
      state.rewards = null;
      state.marketBalance = null;
      state.stakingRewards = null;
      state.isMember = false;
      state.vipCount = 0;
      state.stakeCount = 0;
      state.fetchingNfts = false;
      state.nftsInitialized = false;
      state.nfts = [];
      state.mySoldNftsFetching = false;
      state.mySoldNfts = [];
      state.myUnfilteredListingsFetching = false;
      state.myUnfilteredListings = [];
      state.cnsProfile = {};
    },
    onThemeChanged(state, action) {
      state.theme = action.payload;
    },
    balanceUpdated(state, action) {
      state.balance = action.payload;
    },
    setVIPCount(state, action) {
      state.vipCount = action.payload;
    },
    setStakeCount(state, action) {
      state.stakeCount = action.payload;
    },
    onOutstandingOffersFound(state, action) {
      state.hasOutstandingOffers = action.payload;
    },
    setCnsProfile(state, action) {
      state.cnsProfile = action.payload;
    },
  },
});

export const {
  accountChanged,
  onProvider,
  fetchingNfts,
  onNftsLoaded,
  onNftLoading,
  onNftsAdded,
  onNftsReplace,
  nftsFetched,
  nftsFullyFetched,
  onNftLoaded,
  myUnfilteredListingsFetching,
  myUnfilteredListingsFetched,
  myUnfilteredListingsAdded,
  clearMyUnfilteredListings,
  mySoldNftsFetching,
  mySalesFetched,
  mySalesOnNftsAdded,
  clearMySales,
  connectingWallet,
  onCorrectChain,
  registeredCode,
  withdrewRewards,
  withdrawingMarketBalance,
  withdrewMarketBalance,
  harvestingStakingRewards,
  harvestedStakingRewards,
  listingUpdate,
  transferedNFT,
  setIsMember,
  setShowWrongChainModal,
  onBasicAccountData,
  onLogout,
  elonContract,
  onThemeChanged,
  setVIPCount,
  setStakeCount,
  onOutstandingOffersFound,
  setCnsProfile,
} = userSlice.actions;
export const user = userSlice.reducer;

export const updateListed =
  (contract, id, listed, newPrice = null) =>
  async (dispatch) => {
    dispatch(listingUpdate({ contract, id, listed, newPrice }));
  };

export const connectAccount =
  (firstRun = false, type = '') =>
  async (dispatch) => {
    const providerOptions = {
      injected: {
        display: {
          logo: 'https://github.com/MetaMask/brand-resources/raw/master/SVG/metamask-fox.svg',
          name: 'MetaMask',
          description: 'Connect with MetaMask in your browser',
        },
        package: null,
      },
      'custom-defiwallet': {
        display: {
          logo: '/img/logos/cdc_logo.svg',
          name: 'Crypto.com DeFi Wallet',
          description: 'Connect with the CDC DeFi Wallet',
        },
        options: {},
        package: DefiWalletConnectProvider,
        connector: async (ProviderPackage, options) => {
          const connector = new DeFiWeb3Connector({
            supportedChainIds: [25],
            rpc: { 25: 'https://rpc.ebisusbay.com' },
            pollingInterval: 15000,
            metadata: {
              icons: ['https://ebisusbay.com/vector%20-%20face.svg'],
              description: 'Cronos NFT Marketplace',
            },
          });

          await connector.activate();
          let provider = await connector.getProvider();
          return provider;
        },
      },
    };

    if (type !== 'defi') {
      providerOptions.walletconnect = {
        package: WalletConnectProvider, // required
        options: {
          chainId: 25,
          rpc: {
            25: 'https://rpc.ebisusbay.com',
          },
          network: 'cronos',
          metadata: {
            icons: ['https://ebisusbay.com/vector%20-%20face.svg'],
            description: 'Cronos NFT Marketplace',
          },
        },
      };
    }

    const web3ModalWillShowUp = !localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER');

    if (process.env.NODE_ENV !== 'production') {
      console.log('web3ModalWillShowUp: ', web3ModalWillShowUp);
    }

    const web3Modal = new Web3Modal({
      cacheProvider: true, // optional
      providerOptions, // required
    });

    const web3provider = await web3Modal
      .connect()
      .then((web3provider) => web3provider)
      .catch((error) => {
        captureException(error, { extra: { firstRun } });
        console.log('Could not get a wallet connection', error);
        return null;
      });

    if (!web3provider) {
      dispatch(onLogout());
      return;
    }

    try {
      dispatch(connectingWallet({ connecting: true }));
      const provider = new ethers.providers.Web3Provider(web3provider);

      const cid = await web3provider.request({
        method: 'net_version',
      });

      const correctChain = cid === config.chain.id || cid === Number(config.chain.id);

      const accounts = await web3provider.request({
        method: 'eth_accounts',
        params: [{ chainId: cid }],
      });

      const address = accounts[0];
      const signer = provider.getSigner();

      if (isUserBlacklisted(address)) {
        const error = { err: 'Unable to connect' };
        throw error;
      }

      if (!correctChain) {
        if (firstRun) {
          dispatch(appAuthInitFinished());
        }
        await dispatch(setShowWrongChainModal(true));
      }

      //console.log(correctChain);
      await dispatch(
        onBasicAccountData({
          address: address,
          provider: provider,
          web3modal: web3Modal,
          needsOnboard: false,
          correctChain: correctChain,
        })
      );
      if (firstRun) {
        dispatch(appAuthInitFinished());
      }
      web3provider.on('DeFiConnectorDeactivate', (error) => {
        dispatch(onLogout());
      });

      web3provider.on('disconnect', (error) => {
        dispatch(onLogout());
      });

      web3provider.on('accountsChanged', (accounts) => {
        dispatch(onLogout());
        dispatch(connectAccount());
      });

      web3provider.on('DeFiConnectorUpdate', (accounts) => {
        window.location.reload();
      });

      web3provider.on('chainChanged', (chainId) => {
        // Handle the new chain.
        // Correctly handling chain changes can be complicated.
        // We recommend reloading the page unless you have good reason not to.

        window.location.reload();
      });

      let mc;
      let cc;
      let sc;
      let code;
      let balance;
      let rewards;
      let ownedFounder = 0;
      let ownedVip = 0;
      let market;
      let auction;
      let offer;
      let sales;
      let stakeCount = 0;
      let stakingRewards = 0;

      dispatch(retrieveCnsProfile());

      if (signer && correctChain) {
        mc = new Contract(config.contracts.membership, Membership.abi, signer);
        sc = new Contract(config.contracts.stake, StakeABI.abi, signer);
        const rawCode = await mc.codes(address);
        code = ethers.utils.parseBytes32String(rawCode);
        rewards = ethers.utils.formatEther(await mc.payments(address));
        ownedFounder = await mc.balanceOf(address, 1);
        ownedVip = await mc.balanceOf(address, 2);
        stakeCount = await sc.amountStaked(address);
        market = new Contract(config.contracts.market, Market.abi, signer);
        auction = new Contract(config.contracts.madAuction, Auction.abi, signer);
        offer = new Contract(config.contracts.offer, Offer.abi, signer);
        sales = ethers.utils.formatEther(await market.payments(address));
        stakingRewards = ethers.utils.formatEther(await sc.getReward(address));

        try {
          balance = ethers.utils.formatEther(await provider.getBalance(address));
        } catch (error) {
          console.log('Error checking CRO balance', error);
        }
      }

      await dispatch(
        accountChanged({
          address: address,
          provider: provider,
          web3modal: web3Modal,
          needsOnboard: false,
          correctChain: correctChain,
          membershipContract: mc,
          stakeContract: sc,
          code: code,
          balance: balance,
          rewards: rewards,
          isMember: ownedVip > 0 || ownedFounder > 0 || stakeCount > 0,
          vipCount: ownedVip ? ownedVip.toNumber() : ownedVip,
          stakeCount: stakeCount ? stakeCount.toNumber() : stakeCount,
          marketContract: market,
          auctionContract: auction,
          offerContract: offer,
          marketBalance: sales,
          stakingRewards: stakingRewards,
        })
      );
    } catch (error) {
      captureException(error, {
        extra: {
          firstRun,
          WEB3_CONNECT_CACHED_PROVIDER: localStorage.getItem('WEB3_CONNECT_CACHED_PROVIDER'),
          DeFiLink_session_storage_extension: localStorage.getItem('DeFiLink_session_storage_extension'),
        },
      });
      if (firstRun) {
        dispatch(appAuthInitFinished());
      }
      console.log(error);
      console.log('Error connecting wallet!');
      await web3Modal.clearCachedProvider();
      dispatch(onLogout());
    }
    dispatch(connectingWallet({ connecting: false }));
  };

export const initProvider = () => async (dispatch) => {
  const ethereum = await detectEthereumProvider();

  if (ethereum == null || ethereum !== window.ethereum) {
    console.log('not metamask detected');
  } else {
    const provider = new ethers.providers.Web3Provider(ethereum);
    // const signer = provider.getSigner();
    // const cid = await ethereum.request({
    //   method: 'net_version',
    // });

    // const correctChain = cid === config.chain_id;

    // let mc;
    // if (signer && correctChain) {
    //   mc = new Contract(config.membership_contract, Membership.abi, signer);
    // }
    // const obj = {
    //   provider: provider,
    //   needsOnboard: false,
    //   membershipContract: mc,
    //   correctChain: correctChain,
    // };

    //dispatch(onProvider(obj))

    provider.on('accountsChanged', (accounts) => {
      dispatch(
        accountChanged({
          address: accounts[0],
        })
      );
    });

    provider.on('chainChanged', (chainId) => {
      // Handle the new chain.
      // Correctly handling chain changes can be complicated.
      // We recommend reloading the page unless you have good reason not to.

      window.location.reload();
    });
  }
};

export const chainConnect = (type) => async (dispatch) => {
  if (window.ethereum) {
    const cid = ethers.utils.hexValue(BigNumber.from(config.chain.id));
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: cid }],
      });
    } catch (error) {
      // This error code indicates that the chain has not been added to MetaMask
      // if it is not, then install it into the user MetaMask
      if (error.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainName: config.chain.name,
                chainId: cid,
                rpcUrls: [config.rpc.write],
                blockExplorerUrls: null,
                nativeCurrency: {
                  name: config.chain.symbol,
                  symbol: config.chain.symbol,
                  decimals: 18,
                },
              },
            ],
          });
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: cid }],
          });
        } catch (addError) {
          console.error(addError);
          window.location.reload();
        }
      }
      console.log(error);
    }
  } else {
    new WalletConnectProvider({
      rpc: {
        25: 'https://evm.cronos.org',
      },
      chainId: 25,
    });
  }
};

export const fetchNfts =
  (page, persist = false) =>
  async (dispatch, getState) => {
    const state = getState();

    const walletAddress = state.user.address;
    const walletProvider = state.user.provider;

    dispatch(fetchingNfts({ persist }));
    const response = await getNftsForAddress2(walletAddress, walletProvider, page);
    if (response.length > 0) {
      dispatch(onNftsAdded(response));
      dispatch(nftsFetched());
    } else {
      dispatch(nftsFullyFetched());
    }
  };

export const fetchChainNfts = (abortSignal) => async (dispatch, getState) => {
  const state = getState();

  const walletAddress = state.user.address;
  const walletProvider = state.user.provider;

  dispatch(fetchingNfts());
  try {
    const response = await getNftsForAddress(
      walletAddress,
      walletProvider,
      (nfts) => {
        dispatch(onNftsAdded(nfts));
      },
      abortSignal
    );
    if (abortSignal.aborted) return;
    dispatch(setIsMember(response.isMember));
    await addRanksToNfts(dispatch, getState);
    dispatch(nftsFetched());
  } catch (err) {
    if (err.name === 'AbortError') {
      console.log('aborting previous request');
    }
  }
};

const addRanksToNfts = async (dispatch, getState) => {
  let cSortedNfts = [];
  let currentStateNfts = getState().user.nfts.slice();
  for (let i in currentStateNfts) {
    if (!cSortedNfts[currentStateNfts[i].address]) {
      cSortedNfts[currentStateNfts[i].address] = [];
    }
    cSortedNfts[currentStateNfts[i].address].push({
      key: i,
      nft: currentStateNfts[i],
    });
  }

  for (let collectionId in cSortedNfts) {
    const collectionNfts = cSortedNfts[collectionId];
    const chunks = sliceIntoChunks(collectionNfts, 10);
    for (let i in chunks) {
      let cStateNfts = getState().user.nfts.slice();
      try {
        const rankedNfts = await getNftRankings(
          chunks[i][0].nft.address,
          chunks[i].map((a) => a.nft.id)
        );
        for (let j in rankedNfts) {
          const nft = rankedNfts[j];
          const key = chunks[i].find((a) => ethers.BigNumber.from(a.nft.id).eq(nft.id))?.key;
          if (!key) {
            continue;
          }
          if (nft.rank) {
            cStateNfts[key] = Object.assign({ rank: nft.rank }, cStateNfts[key]);
          } else {
            cStateNfts[key] = Object.assign({ rank: 'N/A' }, cStateNfts[key]);
          }
        }
        dispatch(onNftsReplace(cStateNfts));
      } catch (error) {
        console.log('error while retrieving chunk for rankings', error);
      }
    }
  }
};

export const fetchSales = (walletAddress) => async (dispatch, getState) => {
  const state = getState();
  dispatch(mySoldNftsFetching());

  const listings = await getNftSalesForAddress(walletAddress, state.user.mySoldNftsCurPage + 1);
  dispatch(mySalesFetched(listings));
};

export const fetchUnfilteredListings = (walletAddress) => async (dispatch, getState) => {
  const state = getState();
  const walletProvider = state.user.provider;

  dispatch(myUnfilteredListingsFetching());

  const listings = await getUnfilteredListingsForAddress(
    walletAddress,
    walletProvider,
    state.user.myUnfilteredListingsCurPage + 1
  );
  dispatch(myUnfilteredListingsFetched(listings));
};

export const checkForOutstandingOffers = () => async (dispatch, getState) => {
  const state = getState();
  const collectionsStats = state.collections.collections;
  const nfts = state.offer.myNFTs;

  const collectionAddresses = nfts.map((nft) => nft.nftAddress.toLowerCase());
  const offers = await getAllOffers(collectionAddresses, offerState.ACTIVE.toString());

  const findCollectionFloor = (knownContract) => {
    const collectionStats = collectionsStats.find((o) => {
      if (knownContract.multiToken && o.collection.indexOf('-') !== -1) {
        let parts = o.collection.split('-');
        return caseInsensitiveCompare(knownContract.address, parts[0]) && knownContract.id === parseInt(parts[1]);
      } else {
        return caseInsensitiveCompare(knownContract.address, o.collection);
      }
    });

    return collectionStats ? collectionStats.floorPrice : null;
  };

  const receivedOffers = offers.data.filter((offer) => {
    const nft = nfts.find(
      (c) => caseInsensitiveCompare(c.nftAddress, offer.nftAddress) && parseInt(c.nftId) === parseInt(offer.nftId)
    );

    const knownContract = findCollectionByAddress(offer.nftAddress, offer.nftId);
    if (!knownContract) return false;

    const floorPrice = findCollectionFloor(knownContract);
    const offerPrice = parseInt(offer.price);
    const isAboveOfferThreshold = floorPrice ? offerPrice >= floorPrice / 2 : true;
    const canShowCompletedOffers = !knownContract.multiToken || parseInt(offer.state) === offerState.ACTIVE;

    if (nft && isAboveOfferThreshold && canShowCompletedOffers && !nft.is1155) {
      return true;
    }
    return false;
  });

  dispatch(onOutstandingOffersFound(receivedOffers.length > 0));
};

export const setTheme = (theme) => async (dispatch) => {
  setThemeInStorage(theme);
  dispatch(onThemeChanged(theme));
};

export const updateBalance = () => async (dispatch, getState) => {
  const { user } = getState();
  const { address, provider } = user;
  const balance = ethers.utils.formatEther(await provider.getBalance(address));
  dispatch(userSlice.actions.balanceUpdated(balance));
};

export const retrieveCnsProfile = () => async (dispatch, getState) => {
  const { user } = getState();
  const { address, provider } = user;
  if (!user.provider) return;

  try {
    let cnsProfile = {};
    const cns = new CNS(config.chain.id, provider);
    cnsProfile.name = await cns.getName(address);
    if (cnsProfile.name) {
      cnsProfile.twitter = await cns.name(cnsProfile.name).getText(TextRecords.Twitter);
      cnsProfile.avatar = await cns.name(cnsProfile.name).getText(TextRecords.Avatar);
      cnsProfile.discord = await cns.name(cnsProfile.name).getText(TextRecords.Discord);
      cnsProfile.telegram = await cns.name(cnsProfile.name).getText(TextRecords.Telegram);
      cnsProfile.instagram = await cns.name(cnsProfile.name).getText(TextRecords.Instagram);
      cnsProfile.email = await cns.name(cnsProfile.name).getText(TextRecords.Email);
      cnsProfile.url = await cns.name(cnsProfile.name).getText(TextRecords.Url);

      // cnsProfile.details = await cns.name(cnsProfile.name).getDetails();
      // cnsProfile.owner = await cns.name(cnsProfile.name).getOwner();
      // cnsProfile.content = await cns.name(cnsProfile.name).getContent();
      // cnsProfile.address = await cns.name(cnsProfile.name).getAddress();
      // cnsProfile.resolverAddr = await cns.name(cnsProfile.name).getResolverAddr();
    }
    dispatch(setCnsProfile(cnsProfile));
  } catch (e) {
    console.log('cns error', e);
  }
};

export class AccountMenuActions {
  static withdrawRewards = () => async (dispatch, getState) => {
    const { user } = getState();
    try {
      const tx = await user.membershipContract.withdrawPayments(user.address);
      const receipt = await tx.wait();
      toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
      dispatch(withdrewRewards());
      dispatch(updateBalance());
    } catch (error) {
      if (error.data) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        console.log(error);
        toast.error('Unknown Error');
      }
    }
  };

  static withdrawMarketBalance = () => async (dispatch, getState) => {
    const { user } = getState();
    try {
      dispatch(withdrawingMarketBalance());
      const tx = await user.marketContract.withdrawPayments(user.address);
      const receipt = await tx.wait();
      toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
      dispatch(withdrewMarketBalance({ success: true }));
      dispatch(updateBalance());
    } catch (error) {
      dispatch(withdrewMarketBalance({ success: false }));
      if (error.data) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        console.log(error);
        toast.error('Unknown Error');
      }
    } finally {
    }
  };

  static harvestStakingRewards = () => async (dispatch, getState) => {
    const { user } = getState();
    try {
      dispatch(harvestingStakingRewards());
      const tx = await user.stakeContract.harvest(user.address);
      const receipt = await tx.wait();
      toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
      dispatch(harvestedStakingRewards({ success: true }));
      dispatch(updateBalance());
    } catch (error) {
      dispatch(harvestedStakingRewards({ success: false }));
      if (error.data) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        console.log(error);
        toast.error('Unknown Error');
      }
    }
  };

  static registerCode = () => async (dispatch, getState) => {
    const { user } = getState();
    try {
      const id = nanoid(10);
      const encoded = ethers.utils.formatBytes32String(id);
      const tx = await user.membershipContract.register(encoded);
      const receipt = await tx.wait();
      toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
      dispatch(registeredCode(id));
    } catch (error) {
      if (error.data) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        console.log(error);
        toast.error('Unknown Error');
      }
    }
  };
}

/**
 * Grouping related actions to clean up
 * @abstract use static methods
 * some of these actions don't need to be public.
 * after ts migration we can add private keyword.
 */
export class MyNftPageActions {
  static showMyNftPageTransferDialog = (nft) => async (dispatch) => {
    dispatch(userSlice.actions.setMyNftPageTransferDialog(nft));
  };

  static hideMyNftPageTransferDialog = () => async (dispatch) => {
    dispatch(userSlice.actions.setMyNftPageTransferDialog());
  };

  static showMyNftPageListDialog =
    ({ contract, id, image, name, address }) =>
    async (dispatch) => {
      dispatch(userSlice.actions.setMyNftPageListDialog({ contract, id, image, name, address }));
    };

  static hideMyNftPageListDialog = () => async (dispatch) => {
    dispatch(userSlice.actions.setMyNftPageListDialog(null));
  };

  static showMyNftPageCancelDialog = (nft) => async (dispatch) => {
    dispatch(userSlice.actions.setMyNftPageCancelDialog(nft));
  };

  static hideNftPageCancelDialog = () => async (dispatch) => {
    dispatch(userSlice.actions.setMyNftPageCancelDialog(null));
  };

  static setMyNftPageListedOnly =
    (status = false) =>
    async (dispatch) => {
      dispatch(userSlice.actions.setMyNftPageListedOnly(status));
    };

  static setMyNftPageActiveFilterOption = (filterOption) => async (dispatch) => {
    dispatch(userSlice.actions.setMyNftPageActiveFilterOption(filterOption));
  };

  static transferDialogConfirm = (selectedNft, walletAddress, transferAddress) => async (dispatch) => {
    try {
      dispatch(MyNftPageActions.hideMyNftPageTransferDialog());

      const tx = selectedNft.multiToken
        ? await selectedNft.contract.safeTransferFrom(walletAddress, transferAddress, selectedNft.id, 1, [])
        : await selectedNft.contract.safeTransferFrom(walletAddress, transferAddress, selectedNft.id);

      await tx.wait();

      toast.success(`Transfer successful!`);

      dispatch(transferedNFT(selectedNft));
    } catch (error) {
      if (error.data) {
        toast.error(error.data.message);
      } else if (error.message) {
        toast.error(error.message);
      } else {
        console.log(error);
        toast.error('Unknown Error');
      }
    }
  };

  static listingDialogConfirm =
    ({ contractAddress, nftId, salePrice, marketContract }) =>
    async (dispatch) => {
      try {
        const price = ethers.utils.parseEther(salePrice);

        let tx = await marketContract.makeListing(contractAddress, nftId, price, txExtras);

        let receipt = await tx.wait();

        dispatch(updateListed(contractAddress, nftId, true, salePrice));

        dispatch(MyNftPageActions.hideMyNftPageListDialog());

        toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
      } catch (error) {
        if (error.data) {
          toast.error(error.data.message);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          console.log(error);
          toast.error('Unknown Error');
        }
      }
    };
}

export class MyListingsCollectionPageActions {
  static showMyNftPageCancelDialog = (nft) => async (dispatch) => {
    dispatch(userSlice.actions.setMyNftPageCancelDialog(nft));
  };

  static showMyNftPageListDialog =
    ({ contract, id, image, name, address }) =>
    async (dispatch) => {
      dispatch(userSlice.actions.setMyNftPageListDialog({ contract, id, image, name, address }));
    };

  static setInvalidOnly =
    (status = false) =>
    async (dispatch) => {
      dispatch(userSlice.actions.myUnfilteredListingsInvalidOnly(status));
    };
}

export class MyNftCancelDialogActions {
  static cancelListing =
    ({ listingId, address, id }) =>
    async (dispatch, getState) => {
      const state = getState();
      const marketContract = state.user.marketContract;
      try {
        let tx = await marketContract.cancelListing(listingId);

        const receipt = await tx.wait();

        dispatch(MyNftPageActions.hideNftPageCancelDialog());

        dispatch(updateListed(address, id, false));

        toast.success(createSuccessfulTransactionToastContent(receipt.transactionHash));
      } catch (error) {
        dispatch(MyNftPageActions.hideNftPageCancelDialog());

        if (error.data) {
          toast.error(error.data.message);
        } else if (error.message) {
          toast.error(error.message);
        } else {
          console.log(error);
          toast.error('Unknown Error');
        }
      }
    };
}
