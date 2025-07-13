import fetch from 'node-fetch';
import { COINMARKETCAP_KEY } from './config.js';
import { logResponse } from './logger.js';
import { Coin, CoinMarketCapData, CoinMarketCapResponse, transformToSimplifiedCoin } from './types/coinmarketcapTypes.js';

const FILTER_OUT_STABLES = ['usdt', 'usdc', 'dai', 'tusd', 'busd', 'usdp', 'lusd', 'eur', 'gbp', 'usds', 'usde', 'usd0', 'usd1', 'susd', 'fdusd', 'usdtb'];

const FILTER_OUT_STAKES = ['wbtc', 'wsteth', 'weth', 'cbbtc', 'susde', 'lbtc', 'jlp', 'bnsol']


interface QueryParams {
    [key: string]: string | number | boolean | undefined; // Define the shape of query parameters
}

export interface CoinMarketCapQueryParam extends QueryParams {
    sort: string | undefined,
    sort_dir: string | undefined,
    CMC_PRO_API_KEY: string | undefined,
    limit: number
}

export async function getCoinMarketcapCoins(limit: number = 100): Promise<Coin[]> {
    const queryParams: CoinMarketCapQueryParam = {
        sort: "market_cap",
        sort_dir: "desc",
        CMC_PRO_API_KEY: COINMARKETCAP_KEY,
        limit: limit
    }
    const url = new URL("https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest");
    Object.keys(queryParams).forEach(key => url.searchParams.append(key, String(queryParams[key])));

    const res = await fetch(url);
    const cmcResponse: CoinMarketCapResponse = await res.json() as CoinMarketCapResponse;

    // Log the raw response
    logResponse('coinmarketcap', cmcResponse);

    const coinData: CoinMarketCapData[] = cmcResponse.data;
    const results: Coin[] = coinData
        .filter((c: CoinMarketCapData) => !FILTER_OUT_STABLES.includes(c.symbol.toLowerCase()))
        .filter((c: CoinMarketCapData) => !FILTER_OUT_STAKES.includes(c.symbol.toLowerCase()))
        .map(transformToSimplifiedCoin);

    return results;
}