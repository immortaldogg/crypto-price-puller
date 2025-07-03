const fetch = require("node-fetch");

async function fetchOHLCV(symbol, startTime, endTime) {
    const limit = 1;
    const url = `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=1d&startTime=${startTime}&endTime=${endTime}&limit=${limit}`;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return await res.json();
    } catch (err) {
        console.error(`Failed to fetch ${symbol}: ${err.message}`);
        return [];
    }
}

module.exports = { fetchOHLCV };
