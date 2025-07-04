import { getTopCoins } from "./fetchCoins.js";
import { fetchOHLCV } from "./fetchOHLCV.js";
import { saveCandles } from "./db.js";
import { writeFileSync } from "fs";

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const START_TIME = new Date("2024-01-01T00:00:00Z").getTime();
const NOW = Date.now();

async function main() {
    const coins = await getTopCoins();

    for (const coin of coins) {
        console.log(`\n🔄 Fetching ${coin.binanceSymbol}...`);
        try {
            const candles = await fetchOHLCV(coin.binanceSymbol, START_TIME, NOW, 400);
            if (candles.length <= 0) {
                console.log(`\n🔄 No info on ${coin.binanceSymbol}...`);
            } else {
                console.log(`\n🔄 Inserting ${candles.length} 1D candles ${coin.binanceSymbol}...`);
                saveCandles(coin.binanceSymbol, candles);
            }
        } catch (e) {
            let log = "";
            log += `\n🔄 No info on ${coin.binanceSymbol}...`;
            log += `\nError: `;
            log += e;

            writeFileSync("./logs/pull.log", log);

            console.log();
            console.log('\x1b[31m%s\x1b[0m', log);
        }

        await delay(3000); // to avoid rate limits
    }
    console.log("\n✅ Done.");
}

main();
