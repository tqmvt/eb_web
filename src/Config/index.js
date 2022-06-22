import rpcConfig from '../Assets/networks/rpc_config.json';
import rpcConfigDev from '../Assets/networks/rpc_config_dev.json';
import rpcConfigTestnet from '../Assets/networks/rpc_config_testnet.json';

import Constants from '../constants';
const { Features } = Constants;

export const environments = {
  production: 'production',
  testnet: 'testnet',
  development: 'development',
  local: 'local'
};

export const configData = {
  [environments.production]: {
    chain: {
      name: 'Cronos Mainnet Beta',
      id: '25',
      symbol: 'CRO'
    },
    urls: {
      api: 'https://api.ebisusbay.com/',
      app: 'https://app.ebisusbay.com/',
      cdn: 'https://cdn.ebisusbay.com/',
      subgraph: 'https://graph.ebisusbay.com:8000/subgraphs/name/ebisusbay/'
    },
    rpc: {
      read: 'https://gateway.nebkas.ro/',
      write: 'https://evm.cronos.org/',
    },
    contracts: {
      membership: '0x8d9232Ebc4f06B7b8005CCff0ca401675ceb25F5',
      auction: '0xd488b38d19d5708cbda224c041a24c3e3149bc93',
      market: '0x7a3CdB2364f92369a602CAE81167d0679087e6a3',
      stake: '0xeb074cc764F20d8fE4317ab63f45A85bcE2bEcB1',
      offer: '0x016b347aeb70cc45e3bbaf324feb3c7c464e18b0',
      madAuction: '0x47E79264A9d1343C04F4A56922bE7e6177aE03a0',
      slothtyRugsurance: '0xE9A540CBb2247f9bD86e98d1121aBDD084Ca0e89',
    },
    tokens: {
      loot: {
        'name': 'LOOT',
        'symbol': 'LOOT',
        'address': '0xEd34211cDD2cf76C3cceE162761A72d7b6601E2B'
      },
      mad: {
        'name': 'MAD',
        'symbol': 'MAD',
        'address': '0x212331e1435a8df230715db4c02b2a3a0abf8c61'
      }
    },
    collections: rpcConfig.known_contracts,
    drops: rpcConfig.drops,
    auctions: rpcConfig.auctions,
  },
  [environments.development]: {
    chain: {
      name: 'Cronos Mainnet Beta',
      id: '25',
      symbol: 'CRO'
    },
    urls: {
      api: 'https://api.ebisusbay.biz/',
      app: 'https://app.ebisusbay.biz/',
      cdn: 'https://cdn.ebisusbay.biz/',
      subgraph: 'https://graph.ebisusbay.com:8000/subgraphs/name/ebisusbay/'
    },
    rpc: {
      read: 'https://gateway.nebkas.ro/',
      write: 'https://evm.cronos.org/',
    },
    contracts: {
      membership: '0x8d9232Ebc4f06B7b8005CCff0ca401675ceb25F5',
      auction: '0xd488b38d19d5708cbda224c041a24c3e3149bc93',
      market: '0x7a3CdB2364f92369a602CAE81167d0679087e6a3',
      stake: '0xeb074cc764F20d8fE4317ab63f45A85bcE2bEcB1',
      offer: '0x016b347aeb70cc45e3bbaf324feb3c7c464e18b0',
      madAuction: '0x47E79264A9d1343C04F4A56922bE7e6177aE03a0',
      slothtyRugsurance: '0xE9A540CBb2247f9bD86e98d1121aBDD084Ca0e89',
    },
    tokens: {
      loot: {
        'name': 'LOOT',
        'symbol': 'LOOT',
        'address': '0xEd34211cDD2cf76C3cceE162761A72d7b6601E2B'
      },
      mad: {
        'name': 'MAD',
        'symbol': 'MAD',
        'address': '0x212331e1435a8df230715db4c02b2a3a0abf8c61'
      }
    },
    collections: rpcConfigDev.known_contracts,
    drops: rpcConfigDev.drops,
    auctions: rpcConfigDev.auctions,
  },
  [environments.testnet]: {
    chain: {
      name: 'Cronos Testnet',
      id: '338',
      symbol: 'tCRO'
    },
    urls: {
      api: 'https://testapi.ebisusbay.biz/',
      app: 'https://testapp.ebisusbay.biz/',
      cdn: 'https://cdn.ebisusbay.biz/',
      subgraph: 'https://testgraph.ebisusbay.biz:8000/subgraphs/name/ebisusbay/'
    },
    rpc: {
      read: 'https://rpc.ebisusbay.biz/',
      write: 'https://evm-t3.cronos.org/',
    },
    contracts: {
      membership: '0x3F1590A5984C89e6d5831bFB76788F3517Cdf034',
      auction: '0xbA272524C9BFDa68741Be1A06f8376A749fc4870',
      market: '0xb3cB12e7F9e442ef799a2B7e92f65ab8710d7b27',
      stake: '0x70A9989dd73B026B34462BE158963587dD9ca16f',
      offer: '0x8Dd84fb5d7f8A504BA2398243D768C604f8Daf5E',
      madAuction: '0x84356061d598A7bCE028dB6a37b14F84cf4A5905',
      slothtyRugsurance: '0x99F3960E8219384BF0624D388cAD698d5A54AE6C',
    },
    tokens: {
      loot: {
        'name': 'LOOT',
        'symbol': 'LOOT',
        'address': '0x2074D6a15c5F908707196C5ce982bd0598A666f9'
      },
      mad: {
        'name': 'MAD',
        'symbol': 'MAD',
        'address': '0x4DEdeea250d2cbf54F0e156f0e9b55927094867E'
      }
    },
    collections: rpcConfigTestnet.known_contracts,
    drops: rpcConfigTestnet.drops,
    auctions: rpcConfigTestnet.auctions,
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
  'cdn.ebisusbay.com',
  'cdn.ebisusbay.biz'
];

/**
 * Retrieve a config value using "dot" notation.
 * Passing no key will return the entire config.
 *
 * @param key
 * @returns {null|*}
 */
export const appConfig = (key) => {
  const env = isLocalEnv() ? environments.development : environments[currentEnv()];
  if (!key) return env ? configData[env] : configData[environments.development];

  const keys = key.split('.');

  return keys.reduce((o,i)=> o[i], env ? configData[env] : configData[environments.development]);
}

export const currentEnv = () => {
  return process.env.NEXT_PUBLIC_ENV ?? process.env.NODE_ENV;
}

export const isLocalEnv = () => {
  return currentEnv() === environments.local;
}

export const featureFlags = {
  [Features.AUCTION_OPTION_SALE]: false
}