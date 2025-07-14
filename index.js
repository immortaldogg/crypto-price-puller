import { START_TIME } from "./config.js";
import { getCandlesBySymbol, saveCandles } from "./db.js";
import { getCoinMarketcapCoins } from "./fetchCoins.js";
import { fetchOHLCV } from "./fetchOHLCV.js";

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const NOW = Date.now();

async function main() {
    const coins = await getCoinMarketcapCoins();

    // let coins = [{
    //     id: '...',
    //     name: 'floki',
    //     symbol: 'FLOKI',
    //     exchangeSymbol: 'FARTCOINUSDT'
    // }] 

    for (const coin of coins) {
        console.log(`\n🔄 Fetching ${coin.exchangeSymbol}...`);
        let startTime = START_TIME;

        // pull data up
        const dbCandles = getCandlesBySymbol(coin.exchangeSymbol);
        if (dbCandles.length > 0) {
            const latestCandle = dbCandles[dbCandles.length - 1];
            if (latestCandle && latestCandle.open_time && latestCandle.open_time <= NOW) {
                startTime = latestCandle.open_time;
            }
        }

        console.log(new Date(startTime).toISOString());
        const candles = await fetchOHLCV(coin.exchangeSymbol, startTime, NOW, 1460);
        if (candles.length <= 0) {
            console.log(`\n🔄 No info on ${coin.exchangeSymbol}...`);
        } else {
            console.log(`\n🔄 Inserting ${candles.length} 1D candles ${coin.exchangeSymbol}...`);
            saveCandles(coin.exchangeSymbol, candles);
        }
        await delay(2000); // to avoid rate limits
    }
    console.log("\n✅ Done.");
}

main();
