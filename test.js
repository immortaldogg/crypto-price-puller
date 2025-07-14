import { exportToCsvBySymbol, getCandlesBySymbol } from "./db.js";
import { getTopCoins, getCoinMarketcapCoins } from "./fetchCoins.js";
import { fetchOHLCV } from "./fetchOHLCV.js";
import { saveCandles } from "./db.js";

// let rs = await getTopCoins();

// let rs2 = await fetchOHLCV('BTCUSDT', new Date("2024-01-01T00:00:00Z").getTime(), Date.now(), 365)

// console.log(rs2);

// const t = new Date(1734134400000);
// console.log(t.toISOString());

// const START_TIME = new Date("2024-01-01T00:00:00Z").getTime();
// const NOW = Date.now();

// let exchangeSymbol = 'SEIUSDT';

// const candles = await fetchOHLCV(exchangeSymbol, START_TIME, NOW, 1000);

// console.log(new Date(candles[0][6]).toISOString());
// console.log(new Date(candles[candles.length - 1][6]).toISOString());

// if (candles.length <= 0) {
//     console.log(`\n🔄 No info on ${exchangeSymbol}...`);
// } else {
//     console.log(`\n🔄 Inserting ${candles.length} 1D candles ${exchangeSymbol}...`);
//     saveCandles(exchangeSymbol, candles);
// }

// console.log(
//     '\x1b[32m%s\x1b[0m \x1b[33m%s\x1b[0m \x1b[31m%s\x1b[0m',
//     'GreenText',
//     'YellowText',
//     'RedText'
// );

// let rs = await getCoinMarketcapCoins();
// console.log(rs);

let arr = getCandlesBySymbol('INJUSDT');
console.log(new Date(arr[0].open_time).toISOString());