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

export const getAllOffers = async (addresses, stateFilter) => {
  const allOffersQuery = `
  query($first: Int) {
    offers(first: 1000, where: {nftAddress_in: ${JSON.stringify(addresses)}, state: ${stateFilter}}) {
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
        },
      })
    );
  });

  const { offers } = response.data;

  return {
    data: offers,
  };
};

export const getMyOffers = async (myAddress, stateFilter) => {
  const myOffersQuery = `
  query($first: Int) {
    offers(first: 1000, where: {buyer: "${myAddress.toLowerCase()}", state: ${stateFilter}}) {
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
