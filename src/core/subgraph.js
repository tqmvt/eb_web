import { ApolloClient, InMemoryCache, gql } from '@apollo/client';
import { configData } from 'src/Config';

const CURRENT_ENV = process.env.REACT_APP_ENV;
const APIURL = configData[CURRENT_ENV].subgraphUrl;

const client = new ApolloClient({
  uri: APIURL,
  cache: new InMemoryCache(),
});

export const getInitial = () => {
  const vaultsQuery = `
  query($first: Int) {
    vaults(
      first: $first
    ) {
      id
      name
      symbol
      vaultToken
    }
  }
`;

  client
    .query({
      query: gql(vaultsQuery),
      variables: {
        first: 10,
      },
    })
    .then((data) => console.log('Subgraph data: ', data))
    .catch((err) => {
      console.log('Error fetching data: ', err);
    });
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

// TODO: offers: update query with params
export const getOffersForSingleNFT = async (nftAddress, nftId) => {
  const nftOffersQuery = `
  query($first: Int) {
    offers(first: 1000, where: { nftAddress: "0xcfeee4c7b10c52854e061607c347e0d79c6f73a1", nftId: 2}) {
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
