const { getTopCoins } = require("./fetchCoins");
const { fetchOHLCV } = require("./fetchOHLCV");
const { saveCandles } = require("./db");

const delay = (ms) => new Promise(r => setTimeout(r, ms));
const START_TIME = new Date("2024-01-01T00:00:00Z").getTime();
const NOW = Date.now();

async function main() {
    const coins = await getTopCoins();

    for (const coin of coins) {
        console.log(`\n🔄 Fetching ${coin.binanceSymbol}...`);

        let startTime = START_TIME;
        while (startTime < NOW) {
            const chunk = await fetchOHLCV(coin.binanceSymbol, startTime, NOW);
            if (chunk.length === 0) break;

            saveCandles(coin.binanceSymbol, chunk);

            const lastTime = chunk[chunk.length - 1][0];
            startTime = lastTime + 1;

            await delay(400); // to avoid rate limits
        }
    }

    console.log("\n✅ Done.");
}

main();
