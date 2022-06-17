import { BigNumber, Contract, ethers } from 'ethers';
import * as Sentry from '@sentry/react';
import moment from 'moment';

import { ERC1155, ERC721, MetaPixelsAbi, SouthSideAntsReadAbi } from '../Contracts/Abis';
import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/node';
import { dataURItoBlob } from '../Store/utils';
import { SortOption } from '../Components/Models/sort-option.model';
import { CollectionSortOption } from '../Components/Models/collection-sort-option.model';
import { FilterOption } from '../Components/Models/filter-option.model';
import { limitSizeOptions } from '../Components/components/constants/filter-options';
import {
  caseInsensitiveCompare,
  convertIpfsResource,
  findCollectionByAddress,
  isAntMintPassCollection, isCroniesCollection,
  isMetapixelsCollection,
  isNftBlacklisted,
  isSouthSideAntsCollection,
  isUserBlacklisted,
  isWeirdApesCollection,
} from '../utils';
import { getAntMintPassMetadata, getWeirdApesStakingStatus } from './api/chain';
import { fallbackImageUrl } from './constants';
import {appConfig} from "../Config";

const config = appConfig();
let gatewayTools = new IPFSGatewayTools();
const gateway = 'https://mygateway.mypinata.cloud';
const readProvider = new ethers.providers.JsonRpcProvider(config.rpc.read);
const knownContracts = config.collections;

const api = {
  baseUrl: config.urls.api,
  listings: '/listings',
  collections: '/collections',
  marketData: '/marketdata',
  nft: '/nft',
  auctions: '/auctions',
  unfilteredListings: '/unfilteredlistings',
  collectionSummary: '/collection/summary',
  collectionDetails: '/fullcollections',
  wallets: '/wallets',
  leaders: 'getLeaders',
};

export default api;

//  just for sortAndFetchListings function
let abortController = null;

export async function sortAndFetchListings(
  page,
  sort,
  filter,
  traits,
  powertraits,
  search,
  minPrice,
  maxPrice,
  state,
  pagesize = limitSizeOptions.lg
) {
  let query = {
    state: state ?? 0,
    page: page,
    pageSize: pagesize,
    sortBy: 'listingId',
    direction: 'desc',
  };

  if (filter && filter instanceof FilterOption) {
    let filterParams = filter.toApi();

    // Make backwards compatible with new filter based on /fullcollections endpoint
    if (Object.keys(filterParams).includes('address')) {
      filterParams.collection = filterParams.address;
      delete filterParams.address;
    }
    query = { ...query, ...filterParams };
  }

  if (sort && (sort instanceof SortOption || sort instanceof CollectionSortOption)) {
    query = { ...query, ...sort.toApi() };
  }

  if (traits && Object.keys(traits).length > 0) {
    //  traits      = { traitCategoryName1: {traitName2: true }, traitCategoryName3: {traitName4: false}}
    //  traitFilter = { traitCategoryName1: ['traitName2']}
    const traitFilter = Object.keys(traits)
      .map((traitCategoryName) => {
        const traitCategory = traits[traitCategoryName];

        const traitCategoryKeys = Object.keys(traitCategory);

        const truthyFilters = traitCategoryKeys.filter((traitCategoryKey) => traitCategory[traitCategoryKey]);

        return truthyFilters.length === 0 ? {} : { [traitCategoryName]: truthyFilters };
      })
      .reduce((prev, curr) => ({ ...prev, ...curr }), {});

    query['traits'] = JSON.stringify(traitFilter);
  }

  if (powertraits && Object.keys(powertraits).length > 0) {
    const traitFilter = Object.keys(powertraits)
      .map((traitCategoryName) => {
        const traitCategory = powertraits[traitCategoryName];

        const traitCategoryKeys = Object.keys(traitCategory);

        const truthyFilters = traitCategoryKeys.filter((traitCategoryKey) => traitCategory[traitCategoryKey]);

        return truthyFilters.length === 0 ? {} : { [traitCategoryName]: truthyFilters };
      })
      .reduce((prev, curr) => ({ ...prev, ...curr }), {});

    query['powertraits'] = JSON.stringify(traitFilter);
  }

  if (search) query['search'] = search;
  if (minPrice) query['minPrice'] = minPrice;
  if (maxPrice) query['maxPrice'] = maxPrice;

  const queryString = new URLSearchParams(query);

  const url = new URL(api.listings, `${api.baseUrl}`);
  const uri = `${url}?${queryString}`;

  //  Debugging
  const date = new Date();
  //  Debugging
  const time = `${date.getSeconds()}-${date.getMilliseconds()}`;
  //  Debugging
  const log = (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${time} ${message}`);
    }
  };

  try {
    log(`Ongoing call: ${!!abortController}`);

    if (abortController) {
      abortController.abort();
      log(`Cancelled previous call.`);
    }

    abortController = new AbortController();
    const { signal } = abortController;

    const response = await fetch(uri, { signal });

    abortController = null;
    log(`Went through.`);

    return { cancelled: false, response: await response.json() };
  } catch (error) {
    if (error && error.name === 'AbortError') {
      log(`Cancelled.`);
      return { cancelled: true, response: [] };
    }
    abortController = null;
    throw new TypeError(error);
  }
}

export async function getListing(listingId) {
  try {
    const uri = `${api.baseUrl}${api.listings}?listingId=${listingId}`;
    var rawListing = await (await fetch(uri)).json();

    rawListing = rawListing['listings'][0];

    const isMetaPixels = isMetapixelsCollection(rawListing['nftAddress']);
    if (isMetaPixels) {
      const contract = new Contract(rawListing['nftAddress'], MetaPixelsAbi, readProvider);
      const data = await contract.lands(rawListing['nftId']);
      const plotSize = `${data.xmax - data.xmin + 1}x${data.ymax - data.ymin + 1}`;
      const plotCoords = `(${data.xmin}, ${data.ymin})`;
      rawListing['nft'].description = `Metaverse Pixel plot at ${plotCoords} with a ${plotSize} size`;
    }

    const listing = {
      listingId: rawListing['listingId'],
      nftId: rawListing['nftId'],
      seller: rawListing['seller'],
      nftAddress: rawListing['nftAddress'],
      price: rawListing['price'],
      fee: rawListing['fee'],
      is1155: rawListing['is1155'],
      state: rawListing['state'],
      purchaser: rawListing['purchaser'],
      listingTime: rawListing['listingTime'],
      saleTime: rawListing['saleTime'],
      endingTime: rawListing['endingTime'],
      royalty: rawListing['royalty'],
      nft: rawListing['nft'],
      useIframe: isMetaPixels,
      iframeSource: isMetaPixels ? `https://www.metaversepixels.app/grid?id=${rawListing['nftId']}&zoom=3` : null,
    };
    return listing;
  } catch (error) {
    console.log(error);
    Sentry.captureException(error);
  }
}

export async function getMarketMetadata() {
  const uri = `${api.baseUrl}${api.marketData}`;

  return await (await fetch(uri)).json();
}

export async function getCollectionMetadata(contractAddress, sort, filter) {
  let query = {
    sortBy: 'totalVolume',
    direction: 'desc',
  };
  if (filter != null) query[filter.type] = filter.value;
  if (sort != null && sort.type != null) {
    const sortProps = {
      sortBy: sort.type,
      direction: sort.direction,
    };
    query = { ...query, ...sortProps };
  }
  if (contractAddress != null) {
    query['collection'] = Array.isArray(contractAddress)
      ? contractAddress.map((c) => ethers.utils.getAddress(c.toLowerCase()))
      : ethers.utils.getAddress(contractAddress.toLowerCase());
  }

  const queryString = new URLSearchParams(query);

  const uri = `${api.baseUrl}${api.collections}?${queryString}`;
  return await (await fetch(uri)).json();
}

export async function getCollectionSummary(address) {
  address = Array.isArray(address)
    ? address.map((c) => ethers.utils.getAddress(c.toLowerCase()))
    : ethers.utils.getAddress(address.toLowerCase());

  const query = { address };
  const queryString = new URLSearchParams(query);
  const uri = `${api.baseUrl}${api.collectionSummary}?${queryString}`;
  return await (await fetch(uri)).json();
}

export async function sortAndFetchCollectionDetails(
  page,
  sort,
  filter,
  traits,
  powertraits,
  search,
  filterListed,
  minPrice,
  maxPrice,
  pageSize = 50
) {
  let query = {
    page: page,
    pageSize: pageSize ?? 50,
    sortBy: 'id',
    direction: 'desc',
  };

  if (filter && filter instanceof FilterOption) {
    query = { ...query, ...filter.toApi() };
  }

  if (sort && sort instanceof CollectionSortOption) {
    query = { ...query, ...sort.toApi() };
  }

  if (traits && Object.keys(traits).length > 0) {
    //  traits      = { traitCategoryName1: {traitName2: true }, traitCategoryName3: {traitName4: false}}
    //  traitFilter = { traitCategoryName1: ['traitName2']}
    const traitFilter = Object.keys(traits)
      .map((traitCategoryName) => {
        const traitCategory = traits[traitCategoryName];

        const traitCategoryKeys = Object.keys(traitCategory);

        const truthyFilters = traitCategoryKeys.filter((traitCategoryKey) => traitCategory[traitCategoryKey]);

        return truthyFilters.length === 0 ? {} : { [traitCategoryName]: truthyFilters };
      })
      .reduce((prev, curr) => ({ ...prev, ...curr }), {});

    query['traits'] = JSON.stringify(traitFilter);
  }

  if (powertraits && Object.keys(powertraits).length > 0) {
    const traitFilter = Object.keys(powertraits)
      .map((traitCategoryName) => {
        const traitCategory = powertraits[traitCategoryName];

        const traitCategoryKeys = Object.keys(traitCategory);

        const truthyFilters = traitCategoryKeys.filter((traitCategoryKey) => traitCategory[traitCategoryKey]);

        return truthyFilters.length === 0 ? {} : { [traitCategoryName]: truthyFilters };
      })
      .reduce((prev, curr) => ({ ...prev, ...curr }), {});

    query['powertraits'] = JSON.stringify(traitFilter);
  }

  if (search) query['search'] = search;
  if (filterListed) query['listed'] = filterListed;
  if (minPrice) query['minPrice'] = minPrice;
  if (maxPrice) query['maxPrice'] = maxPrice;

  const queryString = new URLSearchParams(query);

  const url = new URL(api.collectionDetails, `${api.baseUrl}`);
  const uri = `${url}?${queryString}`;

  //  Debugging
  const date = new Date();
  //  Debugging
  const time = `${date.getSeconds()}-${date.getMilliseconds()}`;
  //  Debugging
  const log = (message) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`${time} ${message}`);
    }
  };

  try {
    log(`Ongoing call: ${!!abortController}`);

    if (abortController) {
      abortController.abort();
      log(`Cancelled previous call.`);
    }

    abortController = new AbortController();
    const { signal } = abortController;

    const response = await fetch(uri, { signal });

    abortController = null;
    log(`Went through.`);

    return { cancelled: false, response: await response.json() };
  } catch (error) {
    if (error && error.name === 'AbortError') {
      log(`Cancelled.`);
      return { cancelled: true, response: [] };
    }
    abortController = null;
    throw new TypeError(error);
  }
}

export async function getCollectionTraits(contractAddress) {
  try {
    const internalUri = `https://app.ebisusbay.com/files/${contractAddress.toLowerCase()}/rarity.json`;

    return await (await fetch(internalUri)).json();
  } catch (error) {
    console.log(error);
  }

  return null;
}

export async function getCollectionPowertraits(contractAddress) {
  try {
    const internalUri = `https://app.ebisusbay.com/files/${contractAddress.toLowerCase()}/powertraits.json`;

    return await (await fetch(internalUri)).json();
  } catch (error) {
    console.log(error);
  }

  return null;
}

export async function getNftsForAddress(walletAddress, walletProvider, onNftLoaded, abortSignal) {
  if (!walletAddress || !walletProvider) {
    return;
  }
  // const walletBlacklisted = isUserBlacklisted(walletAddress);

  const signer = walletProvider.getSigner();

  let listings = await getAllListingsForUser(walletAddress);

  //  Helper function
  const getListing = (address, id) => {
    return listings.find((listing) => {
      const sameId = ethers.BigNumber.from(listing['nftId']).eq(id);
      const sameAddress = listing['nftAddress'].toLowerCase() === address.toLowerCase();
      return sameId && sameAddress;
    });
  };

  let response = {
    nfts: [],
    isMember: false,
  };

  await Promise.all(
    knownContracts
      .filter((c) => !!c.address)
      .map(async (knownContract) => {
        try {
          if (abortSignal.aborted) {
            return Promise.reject(new DOMException('Aborted', 'AbortError'));
          }
          const address = knownContract.address;
          const listable = knownContract.listable;
          const isMetaPixels = isMetapixelsCollection(address);
          const isSouthSideAnts = isSouthSideAntsCollection(address);

          if (knownContract.multiToken) {
            const ids = knownContract.tokens?.map((t) => t.id) ?? [knownContract.id];

            for (const id of ids) {
              let canTransfer = true;
              let canSell = true;
              const listed = !!getListing(address, id);
              const listingId = listed ? getListing(address, id).listingId : null;
              const price = listed ? getListing(address, id).price : null;
              // let erc1155Listings = getERC1155Listings(address, id);

              const readContract = new Contract(knownContract.address, ERC1155, readProvider);
              const writeContract = new Contract(knownContract.address, ERC1155, signer);

              readContract.connect(readProvider);
              writeContract.connect(signer);

              let count = await readContract.balanceOf(walletAddress, id);
              count = count.toNumber();
              if (knownContract.address === config.contracts.membership && count > 0) {
                response.isMember = true;
              }
              if (count === 0) {
                return;
              }

              let uri = await readContract.uri(id);

              if (gatewayTools.containsCID(uri)) {
                try {
                  uri = gatewayTools.convertToDesiredGateway(uri, gateway);
                } catch (error) {
                  //console.log(error);
                }
              }

              const json = await (await fetch(uri)).json();
              const name = json.name;
              const image = gatewayTools.containsCID(json.image)
                ? gatewayTools.convertToDesiredGateway(json.image, gateway)
                : json.image;
              const description = json.description;
              const properties = json.properties;

              const nft = {
                name: name,
                id: id,
                image: image,
                video: json.animation_url ?? (image.split('.').pop() === 'mp4' ? image : null),
                count: count,
                description: description,
                properties: properties,
                contract: writeContract,
                address: knownContract.address,
                multiToken: true,
                listable,
                listed,
                listingId,
                price,
                canSell: canSell,
                canTransfer: canTransfer,
              };

              onNftLoaded([nft]);
            }
            /*
            for (const item of erc1155Listings) {
              let nft = {
                name: name,
                id: id,
                image: image,
                description: description,
                properties: properties,
                contract: contract,
                address: knownContract.address,
                multiToken: true,
                listable,
                listed: true,
                listingId: item.listingId,
                price: item.price,
                canSell: canSell,
                canTransfer: canTransfer
              };
              onNftLoaded([nft]);
            }
            for (let i = 0; i < count - erc1155Listings.length; i++) {
              if (erc1155Listings.length == 1) {
                canSell = false;
              }
              if (erc1155Listings == 0 && i != 0) {
                canSell = false;
              }
              console.log(canSell);
              let nft = {
                name: name,
                id: id,
                image: image,
                description: description,
                properties: properties,
                contract: contract,
                address: knownContract.address,
                multiToken: true,
                listable,
                canSell: canSell,
                canTransfer: canTransfer
              };
              onNftLoaded([nft]);
            } */
          } else {
            const writeContract = (() => {
              if (isMetaPixels) {
                return new Contract(address, MetaPixelsAbi, signer);
              }
              return new Contract(address, ERC721, signer);
            })();

            const readContract = (() => {
              if (isMetaPixels) {
                return new Contract(address, MetaPixelsAbi, readProvider);
              }
              if (isSouthSideAnts) {
                return new Contract(address, SouthSideAntsReadAbi, readProvider);
              }
              return new Contract(address, ERC721, readProvider);
            })();

            readContract.connect(readProvider);
            writeContract.connect(signer);

            const count = await readContract.balanceOf(walletAddress);
            let ids = [];
            if (count > 0) {
              try {
                if (isSouthSideAnts) {
                  ids = await readContract.getNftByUser(walletAddress);
                } else {
                  await readContract.tokenOfOwnerByIndex(walletAddress, 0);
                }
              } catch (error) {
                ids = await readContract.walletOfOwner(walletAddress);
              }
            }
            for (let i = 0; i < count; i++) {
              let canTransfer = true;
              let canSell = true;
              let id;
              if (ids.length === 0) {
                try {
                  id = await readContract.tokenOfOwnerByIndex(walletAddress, i);
                } catch (error) {
                  continue;
                }
              } else {
                id = ids[i];
              }
              const nftBlacklisted = isNftBlacklisted(address, id);
              if (nftBlacklisted) {
                canTransfer = false;
                canSell = false;
              }

              const listed = !!getListing(address, id);
              const listingId = listed ? getListing(address, id).listingId : null;
              const price = listed ? getListing(address, id).price : null;

              const uri = await (async () => {
                if (knownContract.name === 'Ant Mint Pass') {
                  //  fix for https://ebisusbay.atlassian.net/browse/WEB-166
                  //  ant mint pass contract hard coded to this uri for now - remove this when CSS goes live
                  return 'https://gateway.pinata.cloud/ipfs/QmWLqeupPQsb4MTtJFjxEniQ1F67gpQCzuszwhZHFx6rUM';
                }

                if (knownContract.name === 'Red Skull Potions') {
                  // fix for CroSkull's Red Skull Potions
                  return `https://gateway.pinata.cloud/ipfs/QmQd9sFZv9aTenGD4q4LWDQWnkM4CwBtJSL82KLveJUNTT/${id}`;
                }
                if (isMetaPixels) {
                  return await readContract.lands(id);
                }

                return await readContract.tokenURI(id);
              })();

              if (isMetaPixels) {
                const numberId = id instanceof BigNumber ? id.toNumber() : id;
                const image = `${uri.image}`.startsWith('https://')
                  ? uri.image
                  : `https://ipfs.metaversepixels.app/ipfs/${uri.image}`;
                const description = uri.detail;
                const name = `${knownContract.name} ${id}`;
                const properties = {};
                const nft = {
                  id: numberId,
                  name,
                  image,
                  description,
                  properties,
                  contract: writeContract,
                  address,
                  multiToken: false,
                  listable: true,
                  transferable: false,
                  listed,
                  listingId,
                  price,
                  canSell: canSell,
                  canTransfer: canTransfer,
                };
                onNftLoaded([nft]);
                continue;
              }

              if (knownContract.onChain) {
                const json = Buffer.from(uri.split(',')[1], 'base64');
                const parsed = JSON.parse(json);
                const name = parsed.name;
                const image = dataURItoBlob(parsed.image, 'image/svg+xml');
                const desc = parsed.description;
                const properties = parsed.properties ? parsed.properties : parsed.attributes;
                const nft = {
                  id: id,
                  name: name,
                  image: URL.createObjectURL(image),
                  description: desc,
                  properties: properties,
                  contract: writeContract,
                  address: knownContract.address,
                  multiToken: false,
                  listable,
                  listed,
                  listingId,
                  price,
                  canSell: canSell,
                  canTransfer: canTransfer,
                };
                onNftLoaded([nft]);
              } else {
                const checkedUri = (() => {
                  try {
                    if (gatewayTools.containsCID(uri) && !uri.startsWith('ar')) {
                      return gatewayTools.convertToDesiredGateway(uri, gateway);
                    }

                    if (uri.startsWith('ar')) {
                      return `https://arweave.net/${uri.substring(5)}`;
                    }

                    return uri;
                  } catch (e) {
                    return uri;
                  }
                })();

                let json;
                if (checkedUri.includes('unrevealed')) {
                  json = {
                    id: id,
                    name: knownContract.name + ' ' + id,
                    description: 'Unrevealed!',
                    image: '',
                    video: '',
                    contract: writeContract,
                    address: knownContract.address,
                    multiToken: false,
                    properties: [],
                    listable,
                    listed,
                    listingId,
                    price,
                    canSell: canSell,
                    canTransfer: canTransfer,
                  };
                } else {
                  json = await (await fetch(checkedUri)).json();
                }
                const image = convertIpfsResource(json.image, json.tooltip);
                const video = convertIpfsResource(json.animation_url, json.tooltip);
                let isStaked;

                if (address === '0x0b289dEa4DCb07b8932436C2BA78bA09Fbd34C44') {
                  if (await readContract.stakedApes(id)) {
                    canTransfer = false;
                    canSell = false;
                    isStaked = true;
                  }
                }
                const nft = {
                  id: id,
                  name: json.name,
                  image: image,
                  video: video,
                  description: json.description,
                  properties: json.properties ? json.properties : json.attributes,
                  contract: writeContract,
                  address: knownContract.address,
                  multiToken: false,
                  listable,
                  listed,
                  listingId,
                  price,
                  canTransfer: canTransfer,
                  canSell: canSell,
                  isStaked: isStaked,
                };
                onNftLoaded([nft]);
              }
            }
          }
        } catch (error) {
          console.log('error fetching ' + knownContract.name);
          console.log(error);
          Sentry.captureException(error);
        }
      })
  );

  return response;
}

export async function getUnfilteredListingsForAddress(walletAddress, walletProvider, page) {
  let query = {
    seller: walletAddress,
    state: 0,
    pageSize: 25,
    page: page,
    sortBy: 'listingTime',
    direction: 'asc',
  };

  // const signer = walletProvider.getSigner();

  try {
    const signer = walletProvider.getSigner();

    const queryString = new URLSearchParams(query);
    const url = new URL(api.unfilteredListings, `${api.baseUrl}`);
    const response = await fetch(`${url}?${queryString}`);
    let json = await response.json();
    const listings = json.listings || [];

    //  array of {id, address} wallet nfts
    const quickWallet = await getQuickWallet(walletAddress);
    const walletNfts = quickWallet.data.map((nft) => {
      return { id: nft.nftId, address: nft.nftAddress };
    });

    const filteredListings = listings
      .map((item) => {
        const { listingId, price, nft, purchaser, valid, state, is1155, nftAddress } = item;
        const { name, image, rank } = nft || {};

        const listingTime = moment(new Date(item.listingTime * 1000)).format('DD/MM/YYYY, HH:mm');
        const id = item.nftId;
        const isInWallet = !!walletNfts.find((walletNft) => caseInsensitiveCompare(walletNft.address, nftAddress) && walletNft.id === id);
        const listed = true;

        const isMetaPixels = isMetapixelsCollection(nftAddress);
        const readContract = (() => {
          if (is1155) {
            return new Contract(nftAddress, ERC1155, signer);
          }
          if (isMetaPixels) {
            return new Contract(nftAddress, MetaPixelsAbi, signer);
          }
          return new Contract(nftAddress, ERC721, signer);
        })();

        const writeContract = (() => {
          if (is1155) {
            return new Contract(nftAddress, ERC1155, signer);
          }
          if (isMetaPixels) {
            return new Contract(nftAddress, MetaPixelsAbi, signer);
          }
          return new Contract(nftAddress, ERC721, signer);
        })();

        readContract.connect(readProvider);
        writeContract.connect(signer);

        return {
          contract: writeContract,
          address: nftAddress,
          id,
          image,
          name,
          state,
          listingTime,
          listed,
          isInWallet,
          listingId,
          price,
          purchaser,
          rank,
          valid,
          useIframe: isMetaPixels,
          iframeSource: isMetaPixels ? `https://www.metaversepixels.app/grid?id=${id}&zoom=3` : null,
        };
      })
      .sort((x) => (x.valid ? 1 : -1));

    json.listings = filteredListings;

    return json;
  } catch (error) {
    console.log('error fetching sales for: ' + walletAddress);
    console.log(error);

    return [];
  }
}

export async function getNftSalesForAddress(walletAddress, page) {
  let query = {
    seller: walletAddress,
    state: 1,
    pageSize: 25,
    page: page,
    sortBy: 'saleTime',
    direction: 'desc',
  };

  try {
    const queryString = new URLSearchParams(query);
    const url = new URL(api.unfilteredListings, `${api.baseUrl}`);
    return await (await fetch(`${url}?${queryString}`)).json();
  } catch (error) {
    console.log('error fetching sales for: ' + walletAddress);
    console.log(error);
    Sentry.captureException(error);

    return [];
  }
}

export async function getNftSalesHistory(collectionId, nftId) {
  try {
    const queryString = new URLSearchParams({
      collection: collectionId.toLowerCase(),
      tokenId: nftId,
    });

    const url = new URL(api.nft, `${api.baseUrl}`);
    const uri = `${url}?${queryString}`;

    const result = await (await fetch(uri)).json();

    return result.listings ?? [];
  } catch (error) {
    console.log(error);
    Sentry.captureException(error);
    return [];
  }
}

export async function getNft(collectionId, nftId, useFallback = true) {
  try {
    const queryString = new URLSearchParams({
      collection: collectionId.toLowerCase(),
      tokenId: nftId,
    });

    const url = new URL(api.nft, `${api.baseUrl}`);
    const uri = `${url}?${queryString}`;

    const result = await (await fetch(uri)).json();

    if (useFallback && !result.nft) {
      result.nft = await getNftFromFile(collectionId, nftId);
    }

    const isMetaPixels = isMetapixelsCollection(collectionId);
    if (isMetaPixels) {
      const contract = new Contract(collectionId, MetaPixelsAbi, readProvider);
      const data = await contract.lands(nftId);
      const plotSize = `${data.xmax - data.xmin + 1}x${data.ymax - data.ymin + 1}`;
      const plotCoords = `(${data.xmin}, ${data.ymin})`;
      result.nft.description = `Metaverse Pixel plot at ${plotCoords} with a ${plotSize} size`;
    }

    return result;
  } catch (error) {
    console.log(error);
    Sentry.captureException(error);
    return await getNftFromFile(collectionId, nftId);
  }
}

export async function getNftFromFile(collectionId, nftId) {
  try {
    const isMetaPixels = isMetapixelsCollection(collectionId);

    let nft;
    try {
      const internalUri = `https://app.ebisusbay.com/files/${collectionId.toLowerCase()}/metadata/${nftId}.json`;

      return await (await fetch(internalUri)).json();
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }
    var canTransfer = true;
    var canSell = true;
    if (isCroniesCollection(collectionId)) {
      const contract = new Contract(collectionId, ERC721, readProvider);
      let uri = await contract.tokenURI(nftId);

      const json = Buffer.from(uri.split(',')[1], 'base64');
      const parsed = JSON.parse(json);
      const name = parsed.name;
      const image = dataURItoBlob(parsed.image, 'image/svg+xml');
      const desc = parsed.description;
      const properties = []; //(parsed.properties) ? parsed.properties : parsed.attributes;
      nft = {
        name: name,
        image: URL.createObjectURL(image),
        description: desc,
        properties: properties,
        canTransfer: canTransfer,
        canSell: canSell,
      };
    } else if (isMetaPixels) {
      const contract = new Contract(collectionId, MetaPixelsAbi, readProvider);
      const uri = await contract.lands(nftId);

      const numberId = nftId instanceof BigNumber ? nftId.toNumber() : nftId;
      const image = `${uri.image}`.startsWith('https://')
        ? uri.image
        : `https://ipfs.metaversepixels.app/ipfs/${uri.image}`;
      const description = uri.detail;
      const name = `MetaPixels ${numberId}`;
      const properties = {};
      nft = {
        name,
        image,
        description,
        properties,
        useIframe: true,
        iframeSource: `https://www.metaversepixels.app/grid?id=${numberId}&zoom=3`,
        canTransfer: canTransfer,
        canSell: canSell,
      };
    } else {
      const isMultiToken =
        knownContracts.findIndex((x) => caseInsensitiveCompare(x.address, collectionId) && x.multiToken) > -1;

      let uri;
      var contract;
      if (isMultiToken) {
        contract = new Contract(collectionId, ERC1155, readProvider);
        uri = await contract.uri(nftId);
      } else {
        contract = new Contract(collectionId, ERC721, readProvider);
        uri = await contract.tokenURI(nftId);
      }

      if (isAntMintPassCollection(collectionId)) {
        uri = 'https://gateway.pinata.cloud/ipfs/QmWLqeupPQsb4MTtJFjxEniQ1F67gpQCzuszwhZHFx6rUM';
      }

      if (gatewayTools.containsCID(uri)) {
        try {
          uri = gatewayTools.convertToDesiredGateway(uri, gateway);
        } catch (error) {
          // console.log(error);
        }
      }
      let json;

      if (uri.includes('unrevealed')) {
        return null;
      } else {
        json = await (await fetch(uri)).json();
      }
      let image;
      if (gatewayTools.containsCID(json.image)) {
        try {
          image = gatewayTools.convertToDesiredGateway(json.image, gateway);
        } catch (error) {
          image = json.image;
        }
      } else {
        image = json.image;
      }
      const video = convertIpfsResource(json.animation_url, json.tooltip);

      let isStaked;
      if (collectionId === '0x0b289dEa4DCb07b8932436C2BA78bA09Fbd34C44') {
        if (await contract.stakedApes(nftId)) {
          canTransfer = false;
          canSell = false;
          isStaked = true;
        }
      }
      const properties = json.properties && Array.isArray(json.properties) ? json.properties : json.attributes;
      nft = {
        name: json.name,
        image: image,
        video: video,
        description: json.description,
        properties: properties ? properties : [],
        canTransfer: canTransfer,
        canSell: canSell,
        isStaked: isStaked,
      };
    }

    return nft;
  } catch (error) {
    console.log(error);
    Sentry.captureException(error);
  }
}

export async function getNftRankings(contractAddress, nftIds) {
  const commaIds = [].concat(nftIds).join(',');

  let query = {
    collection: contractAddress,
    tokenId: commaIds,
  };

  const queryString = new URLSearchParams(query);
  const url = new URL(api.nft, `${api.baseUrl}`);
  const response = await fetch(`${url}?${queryString}`);
  let json = await response.json();

  if (json.data) {
    return json.data.map((o) => {
      return {
        id: o.nft?.nftId ?? 0,
        rank: o.nft?.rank ?? 0,
      };
    });
  } else if (json.nft) {
    return [
      {
        id: json.nft.nftId,
        rank: json.nft.rank,
      },
    ];
  } else {
    return [];
  }
}

export async function sortAndFetchAuctions(page) {
  const url = new URL(api.auctions, `${api.baseUrl}`);
  return await (await fetch(url)).json();
}

export async function getAuction(hash, index) {
  try {
    let queryString = new URLSearchParams({
      auctionHash: hash,
      auctionIndex: index,
    });

    const url = new URL(api.auctions, `${api.baseUrl}`);
    const uri = `${url}?${queryString}`;
    var rawListing = await (await fetch(uri)).json();

    return rawListing['auctions'][0];
  } catch (error) {
    console.log(error);
    Sentry.captureException(error);
  }
}

export async function getQuickWallet(walletAddress, queryParams = {}) {
  const pagingSupported = true;

  const defaultParams = {
    wallet: walletAddress,
    pageSize: 1000,
  };

  let queryString = new URLSearchParams(defaultParams);
  if (pagingSupported) {
    queryString = new URLSearchParams({
      ...defaultParams,
      ...queryParams,
    });
  }

  const url = new URL(api.wallets, `${api.baseUrl}`);
  const uri = `${url}?${queryString}`;

  const json = await (await fetch(uri)).json();

  if (json.status !== 200 || !json.data) return { ...json, ...{ data: [] } };

  // @todo: remove once api has this version in prod
  if (!Array.isArray(json.data)) {
    json.data = [...json.data.erc1155, ...json.data.erc721];
  }

  return json;
}

async function getAllListingsForUser(walletAddress) {
  let listings = [];
  let chunkParams = { complete: false, pageSize: 100, curPage: 1 };
  while (!chunkParams.complete) {
    const queryString = new URLSearchParams({
      state: 0,
      page: chunkParams.curPage,
      pageSize: chunkParams.pageSize,
      seller: walletAddress,
    });
    const url = new URL(api.listings, `${api.baseUrl}`);
    const listingsReponse = await (await fetch(`${url}?${queryString}`)).json();
    listings = [...listings, ...listingsReponse.listings];
    chunkParams.complete = listingsReponse.listings.length < chunkParams.pageSize;
    chunkParams.curPage++;
  }

  return listings;
}

export async function getNftsForAddress2(walletAddress, walletProvider, page) {
  const quickWallet = await getQuickWallet(walletAddress, { page });
  if (!quickWallet.data) return [];

  const results = quickWallet.data;
  const signer = walletProvider.getSigner();
  const walletBlacklisted = isUserBlacklisted(walletAddress);

  let listings = await getAllListingsForUser(walletAddress);

  //  Helper function
  const getListing = (address, id) => {
    return listings.find((listing) => {
      const sameId = parseInt(listing.nftId) === parseInt(id);
      const sameAddress = caseInsensitiveCompare(listing.nftAddress, address);
      return sameId && sameAddress;
    });
  };

  const writeContracts = [];
  return await Promise.all(
    results
      .filter((nft) => {
        const matchedContract = findCollectionByAddress(nft.nftAddress, nft.nftId);
        if (!matchedContract) return false;

        const hasBalance = !matchedContract.multiToken || parseInt(nft.balance) > 0;

        return matchedContract && hasBalance;
      })
      .map(async (nft) => {
        const knownContract = findCollectionByAddress(nft.nftAddress, nft.nftId);

        let key = knownContract.address;
        if (knownContract.multiToken) {
          key = `${key}${knownContract.id}`;
        }
        const writeContract =
          writeContracts[key] ??
          new Contract(knownContract.address, knownContract.multiToken ? ERC1155 : ERC721, signer);
        writeContracts[key] = writeContract;

        const listed = !!getListing(knownContract.address, nft.nftId);
        const listingId = listed ? getListing(knownContract.address, nft.nftId).listingId : null;
        const price = listed ? getListing(knownContract.address, nft.nftId).price : null;

        if (isAntMintPassCollection(nft.nftAddress)) {
          const metadata = await getAntMintPassMetadata(nft.nftAddress, nft.nftId);
          if (metadata) nft = { ...nft, ...metadata };
        }

        let image;
        let name = nft.name;
        try {
          if (nft.image_aws || nft.image) {
            image = nft.image_aws ?? nft.image;
          } else if (nft.token_uri) {
            if (typeof nft.token_uri === 'string') {
              const uri = nft.token_uri;
              const checkedUri = (() => {
                try {
                  if (gatewayTools.containsCID(uri) && !uri.startsWith('ar')) {
                    return gatewayTools.convertToDesiredGateway(uri, gateway);
                  }

                  if (uri.startsWith('ar')) {
                    return `https://arweave.net/${uri.substring(5)}`;
                  }

                  return uri;
                } catch (e) {
                  return uri;
                }
              })();

              const json = await (await fetch(checkedUri)).json();
              image = convertIpfsResource(json.image);
              if (json.name) name = json.name;
            } else if (typeof nft.token_uri === 'object') {
              image = nft.token_uri.image;
            }
          } else {
            image = fallbackImageUrl;
          }
        } catch (e) {
          image = fallbackImageUrl;
          console.log(e);
        }
        if (!image) image = fallbackImageUrl;

        const video = nft.animation_url ?? (image.split('.').pop() === 'mp4' ? image : null);

        let isStaked = false;
        let canTransfer = true;
        let canSell = true;
        if (isWeirdApesCollection(nft.nftAddress)) {
          const staked = await getWeirdApesStakingStatus(nft.nftAddress, nft.nftId);
          if (staked) {
            canTransfer = false;
            canSell = false;
            isStaked = true;
          }
        }

        if (walletBlacklisted || isNftBlacklisted(nft.nftAddress, nft.nftId)) {
          canTransfer = false;
          canSell = false;
        }

        return {
          id: nft.nftId,
          name: name,
          description: nft.description,
          properties: nft.properties && nft.properties.length > 0 ? nft.properties : nft.attributes,
          image: image,
          video: video,
          count: nft.balance,
          address: knownContract.address,
          contract: writeContract,
          multiToken: knownContract.multiToken,
          rank: nft.rank,
          listable: knownContract.listable,
          listed,
          listingId,
          price,
          canSell: canSell,
          canTransfer: canTransfer,
          isStaked: isStaked,
        };
      })
  );
}

export async function getLeaders(timeframe) {
  const urls = [
    `${api.baseUrl}${api.leaders}?sortBy=totalVolume&direction=desc${timeframe ? `&timeframe=${timeframe}` : ''}`,
    `${api.baseUrl}${api.leaders}?sortBy=buyVolume&direction=desc${timeframe ? `&timeframe=${timeframe}` : ''}`,
    `${api.baseUrl}${api.leaders}?sortBy=saleVolume&direction=desc${timeframe ? `&timeframe=${timeframe}` : ''}`,
    `${api.baseUrl}${api.leaders}?sortBy=highestSale&direction=desc${timeframe ? `&timeframe=${timeframe}` : ''}`,
  ];
  // map every url to the promise of the fetch
  let requests = urls.map((url) => fetch(url));

  // Promise.all waits until all jobs are resolved
  return Promise.all(requests).then((responses) => Promise.all(responses.map((r) => r.json())));
}
