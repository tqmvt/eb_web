import {appConfig} from "../../../Config";

const config = appConfig();
const api = {
  baseUrl: config.urls.api,
  endpoint: '/wallets',
};

export async function getQuickWallet(walletAddress, queryParams = {}) {
  const defaultParams = {
    wallet: walletAddress,
    pageSize: 50,
  };

  let queryString = new URLSearchParams({
    ...defaultParams,
    ...queryParams,
  });

  const url = new URL(api.endpoint, `${api.baseUrl}`);
  const uri = `${url}?${queryString}`;

  const json = await (await fetch(uri)).json();

  if (json.status !== 200 || !json.data) return { ...json, ...{ data: [] } };

  json.data = [...json.data.erc1155, ...json.data.erc721];

  return json;
}