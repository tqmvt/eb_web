import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import config from '../Assets/networks/rpc_config.json';

// import { configData } from 'src/Config';

// const CURRENT_ENV = process.env.REACT_APP_ENV;
// const APIURL = configData[CURRENT_ENV].subgraphUrl;
const APIURL = `${config.subgraph_base}${config.chain_id === '25' ? 'offers' : 'offers-testnet'}`;

const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache(),
});

export const getAllOffers = async (addresses) => {
  const allOffersQuery = `
  query($first: Int) {
    offers(first: 1000) {
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
          first: 1000,
          where: { nftAddress: addresses },
        },
      })
    );
  });

  const { offers } = response.data;

  return {
    data: offers,
  };
};

export const getMyOffers = async (myAddress) => {
  const myOffersQuery = `
  query($first: Int) {
    offers(first: 1000, where: {buyer: "${myAddress.toLowerCase()}"}) {
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
      })
    );
  });

  const { offers } = response.data;

  return {
    data: offers,
  };
};

export const getReceivedOffers = async (myAddress) => {
  const myOffersQuery = `
  query($first: Int) {
    offers(first: 1000, where: {seller: "${myAddress.toLowerCase()}"}) {
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
    offers(first: 1000, where: { nftAddress: "${nftAddress}", nftId: ${nftId}}) {
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
