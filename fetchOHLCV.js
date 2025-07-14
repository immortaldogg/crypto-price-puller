import { appendFileSync } from "fs";
import fetch from "node-fetch";

export async function fetchOHLCV(symbol, startTime, endTime, limit = 1) {
    const url = `https://api.mexc.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=${limit}&startTime=${startTime}&endTime=${endTime}`;
    // const url = `https://api.mexc.com/api/v3/klines?symbol=${symbol}&interval=1d&limit=${limit}&startTime=${startTime}`;
    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
        return await res.json();
    }
    catch (err) {
        console.error(`Failed to fetch ${symbol}: ${err.message}`);
        let log = "";
        log += `\n🔄 No info on ${symbol}...`;
        log += `\nError: `;
        log += err;
        appendFileSync("./logs/pull.log", log);
        return [];
    }
}