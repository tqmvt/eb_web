export const environments = {
  production: 'production',
  testnet: 'testnet',
  development: 'development',
};

export const configData = {
  [environments.testnet]: {
    subgraphUrl: 'https://testgraph.ebisusbay.biz:8000/subgraphs/name/ebisusbay/offers-testnet',
  },
};
