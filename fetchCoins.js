import fetch from 'node-fetch';

const STABLES = ['usdt', 'usdc', 'dai', 'tusd', 'busd', 'usdp', 'lusd', 'eur', 'gbp', 'usds', 'usde', 'usd0', 'usd1', 'susd', 'fdusd', 'usdtb'];

const STAKES = ['wbtc', 'wsteth', 'weth', 'cbbtc', 'susde', 'lbtc', 'jlp', 'bnsol']

export async function getTopCoins() {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=200&page=1`;
    const res = await fetch(url);
    const coins = await res.json();

    return coins
        .filter(c => !STABLES.includes(c.symbol.toLowerCase()))
        .filter(c => !STAKES.includes(c.symbol.toLowerCase()))
        .map(c => ({
            id: c.id,
            name: c.name,
            symbol: c.symbol.toUpperCase(),
            binanceSymbol: c.symbol.toUpperCase() + 'USDT'
        }));
}
