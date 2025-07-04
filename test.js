import { exportToCsvBySymbol } from "./db.js";
import { getTopCoins } from "./fetchCoins.js";
import { fetchOHLCV } from "./fetchOHLCV.js";

// let rs = await getTopCoins();

// let rs2 = await fetchOHLCV('BTCUSDT', new Date("2024-01-01T00:00:00Z").getTime(), Date.now(), 365)

// console.log(rs2);

exportToCsvBySymbol('EIGENUSDT');