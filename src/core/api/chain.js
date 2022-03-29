import {BigNumber, Contract, ethers} from "ethers";
import {ERC721} from "../../Contracts/Abis";
import config from "../../Assets/networks/rpc_config.json";
import IPFSGatewayTools from '@pinata/ipfs-gateway-tools/dist/browser';

const readProvider = new ethers.providers.JsonRpcProvider(config.read_rpc);
const gatewayTools = new IPFSGatewayTools();
const gateway = 'https://mygateway.mypinata.cloud';


export const getSlothty721NftsFromWallet = async (collectionAddress, walletAddress) => {
    const readContract = new Contract(collectionAddress, ERC721, readProvider);

    const count = await readContract.balanceOf(walletAddress);

    let nfts = [];

    for (let i = 0; i < count; i++) {
        let id;
        try {
            id = await readContract.tokenOfOwnerByIndex(walletAddress, i);
        } catch (error) {
            continue;
        }
        const nft = await get721NftById(collectionAddress, id, readContract);
        nfts.push(nft);
    }

    return nfts;
}

export const getSlothty721NftsFromIds = async (collectionAddress, tokenIds) => {
    const readContract = new Contract(collectionAddress, ERC721, readProvider);

    let nfts = [];

    for (let i = 0; i < tokenIds.length; i++) {
        const nft = await get721NftById(collectionAddress, tokenIds[i], readContract);
        nfts.push(nft);
    }

    return nfts;
}

const get721NftById = async (collectionAddress, tokenId, readContract = null) => {
    if (!readContract) readContract = new Contract(collectionAddress, ERC721, readProvider);

    const uri = await readContract.tokenURI(tokenId);

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

    let json = await (await fetch(checkedUri)).json();
    const image = getImageFromMetadata(json);

    const numberId = tokenId instanceof BigNumber ? tokenId.toNumber() : tokenId;
    return {
        id: numberId,
        name: json.name,
        image: image,
        description: json.description,
        properties: json.properties ? json.properties : json.attributes,
        address: collectionAddress,
        multiToken: false
    };
}

const getImageFromMetadata = (json) => {
    let image;
    if (json.image.startsWith('ipfs')) {
        image = `${gateway}/ipfs/${json.image.substring(7)}`;
    } else if (gatewayTools.containsCID(json.image) && !json.image.startsWith('ar')) {
        try {
            image = gatewayTools.convertToDesiredGateway(json.image, gateway);
        } catch (error) {
            image = json.image;
        }
    } else if (json.image.startsWith('ar')) {
        if (typeof json.tooltip !== 'undefined') {
            image = `https://arweave.net/${json.tooltip.substring(5)}`;
        } else {
            image = `https://arweave.net/${json.image.substring(5)}`;
        }
    } else {
        image = json.image;
    }

    return image;
}