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

export const imageDomains = [
  'ipfs.io',
  'app.ebisusbay.com',
  'files.ebisusbay.com',
  'gateway.ebisusbay.com',
  'ebisusbay.mypinata.cloud',
  'res.cloudinary.com',
  'ebisusbay.imgix.net',
  'metadata.cronos.domains',
  'ik.imagekit.io',
  'cdn.ebisusbay.com'
];

// export const cloudinaryUrl = 'https://res.cloudinary.com/ebisusbay/image/fetch/';
