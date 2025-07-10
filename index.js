import { getTopCoins, getCoinMarketcapCoins } from "./fetchCoins.js";
import { fetchOHLCV } from "./fetchOHLCV.js";
import { saveCandles } from "./db.js";
import { writeFileSync } from "fs";

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const START_TIME = new Date("2021-01-01T00:00:00Z").getTime();
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
        try {
            const candles = await fetchOHLCV(coin.exchangeSymbol, START_TIME, NOW, 1460);
            if (candles.length <= 0) {
                console.log(`\n🔄 No info on ${coin.exchangeSymbol}...`);
            } else {
                console.log(`\n🔄 Inserting ${candles.length} 1D candles ${coin.exchangeSymbol}...`);
                saveCandles(coin.exchangeSymbol, candles);
            }
        } catch (e) {
            let log = "";
            log += `\n🔄 No info on ${coin.exchangeSymbol}...`;
            log += `\nError: `;
            log += e;

            writeFileSync("./logs/pull.log", log);

            console.log();
            console.log('\x1b[31m%s\x1b[0m', log);
        }

        await delay(2000); // to avoid rate limits
    }
    console.log("\n✅ Done.");
}

main();
