import fetch from 'node-fetch';
import { FILTER_OUT_STABLES, FILTER_OUT_STAKES, COINMARKETCAP_KEY } from './config.js';

export async function getTopCoins() {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=500&page=1`;
    const res = await fetch(url);
    const coins = await res.json();

    return coins
        .filter(c => !FILTER_OUT_STABLES.includes(c.symbol.toLowerCase()))
        .filter(c => !FILTER_OUT_STAKES.includes(c.symbol.toLowerCase()))
        .map(c => ({
            id: c.id,
            name: c.name,
            symbol: c.symbol.toUpperCase(),
            exchangeSymbol: c.symbol.toUpperCase() + 'USDT'
        }));
}

export async function getCoinMarketcapCoins() {
    const url = `https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest?limit=500&sort=market_cap&sort_dir=desc&CMC_PRO_API_KEY=${COINMARKETCAP_KEY}`;
    const res = await fetch(url);
    const coins = await res.json();

    return coins.data
        .filter(c => !STABLES.includes(c.symbol.toLowerCase()))
        .filter(c => !STAKES.includes(c.symbol.toLowerCase()))
        .map(c => ({
            id: c.id,
            name: c.name,
            symbol: c.symbol.toUpperCase(),
            exchangeSymbol: c.symbol.toUpperCase() + 'USDT'
        }));
}