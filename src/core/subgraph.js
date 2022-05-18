import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import config from '../Assets/networks/rpc_config.json';

const APIURL = `${config.subgraph_base}${config.chain_id === '25' ? 'offers' : 'offers-testnet'}`;

const FIRST = 1000;

const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache(),
});

export const getAllOffers = async (addresses, stateFilter, lastId) => {
  const allOffersQuery = `
  query($first: Int, $addresses: [String], $state: String, $lastId: String) {
    offers(first: $first, where: {nftAddress_in: $addresses, state: $state, id_gt: $lastId}) {
        id
        hash
        offerIndex
        nftAddress
        nftId
        buyer
        seller
        coinAddress
        price
        state
        timeCreated
        timeUpdated
        timeEnded
    }
  }
`;

  const response = await new Promise((resolve) => {
    resolve(
      client.query({
        query: gql(allOffersQuery),
        variables: {
          first: FIRST,
          addresses,
          state: stateFilter,
          lastId: lastId || '',
        },
        fetchPolicy: 'no-cache',
      })
    );
  });

  const { offers } = response.data;

  return {
    data: offers,
  };
};

export const getMyOffers = async (myAddress, stateFilter, lastId) => {
  const myOffersQuery = `
  query($first: Int, $buyer: String, $state: String, $lastId: String) {
    offers(first: $first, where: {buyer: $buyer, state: $state, id_gt: $lastId}) {
        id
        hash
        offerIndex
        nftAddress
        nftId
        buyer
        seller
        coinAddress
        price
        state
        timeCreated
        timeUpdated
        timeEnded
    }
  }
`;

  const response = await new Promise((resolve) => {
    resolve(
      client.query({
        query: gql(myOffersQuery),
        variables: {
          first: FIRST,
          buyer: myAddress.toLowerCase(),
          state: stateFilter,
          lastId: lastId || '',
        },
        fetchPolicy: 'no-cache',
      })
    );
  });

  const { offers } = response.data;

  return {
    data: offers,
  };
};

export const getFilteredOffers = async (nftAddress, nftId, walletAddress) => {
  const myOffersQuery = `
  query($first: Int) {
    offers(first: 1000, where: {nftAddress: "${nftAddress.toLowerCase()}", buyer: "${walletAddress.toLowerCase()}", nftId: "${nftId}"}) {
        id
        hash
        offerIndex
        nftAddress
        nftId
        buyer
        seller
        coinAddress
        price
        state
        timeCreated
        timeUpdated
        timeEnded
    }
  }
`;

  const response = await new Promise((resolve) => {
    resolve(
      client.query({
        query: gql(myOffersQuery),
        variables: {
          first: 100,
        },
        fetchPolicy: 'no-cache',
      })
    );
  });

  const { offers } = response.data;

  return {
    data: offers,
  };
};

export const getOffersForSingleNFT = async (nftAddress, nftId) => {
  const nftOffersQuery = `
  query($first: Int) {
    offers(first: 1000, where: { nftAddress: "${nftAddress}", nftId: "${nftId}"}) {
      id
      hash
      offerIndex
      nftAddress
      nftId
      buyer
      seller
      coinAddress
      price
      state
      timeCreated
      timeUpdated
      timeEnded
    }
  }
`;

  const response = await new Promise((resolve) => {
    resolve(
      client.query({
        query: gql(nftOffersQuery),
        variables: {
          first: 100,
        },
      })
    );
  });

  const { offers } = response.data;

  return {
    data: offers,
  };
};
