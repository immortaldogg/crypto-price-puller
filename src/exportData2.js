import { getAllSymbols, getCandlesBySymbol } from "./db.js";
import fs from 'fs';

let PIVOT_RANGE = {
    pivot0: new Date('2025-04-01'),
    pivot1: new Date('2025-06-20'),
    pivot2: new Date('2025-07-06'),
}
let symbols = getAllSymbols().map(s => s.symbol);

let results = [];

let testSymbols = [
    'BTC', 
    'ETH', 
    'SOL', 
    'XRP', 
    'DOGE', 
    'SUI',
    'XLM',
    'STX',
    'INJ',
    'GRASS',
    'VELO'
].map(s => s + 'USDT');

for (const symbol of symbols) {
    // if (symbol !== 'BTCUSDT') continue;
    // if (symbol === 'ABUSDT') continue;
    transformToPresentation(symbol);
}

function checkAcceptableData(candles) {
    if (candles.length <= 1) {
        console.log('\x1b[31m%s\x1b[0m', 'SKIP BECAUSE NOT ENOUGH CANDLES');
        return false;
    }
    let earliestDate = new Date(candles[1].open_time);
    let latestDate = new Date(candles[candles.length - 1].open_time);
    // filter out bad data - if earliest date is before pivot range, skip
    if (earliestDate > PIVOT_RANGE.pivot0) {
        console.log('\x1b[31m%s\x1b[0m', 'SKIP BECAUSE EARLIEST DATE IS BEFORE PIVOT RANGE');
        return false;
    }
    // filter out bad data - if coins get delisted
    if (latestDate < PIVOT_RANGE.pivot2) {
        console.log('\x1b[31m%s\x1b[0m', 'SKIP BECAUSE LATEST DATE IS BEFORE PIVOT RANGE');
        return false;
    }

    return true;
}

function transformToPresentation(symbol) {
    const candles = getCandlesBySymbol(symbol).slice(1);
    let prevHigh = 0;
    let low = 500000;
    let high = 0;
    if (candles.length <= 1) {
        console.log('\x1b[31m%s\x1b[0m', 'SKIP BECAUSE NOT ENOUGH CANDLES');
        return false;
    }
    let earliestDate = new Date(candles[1].open_time);
    let latestDate = new Date(candles[candles.length - 1].open_time);

    if (!checkAcceptableData(candles)) return;

    for (const candle of candles) {
        const openTime = new Date(candle.open_time);
        if (openTime < PIVOT_RANGE.pivot0) continue;

        if (openTime <= PIVOT_RANGE.pivot1) {
            prevHigh = Math.max(prevHigh, parseFloat(candle.high));
            continue;
        }
        if (openTime <= PIVOT_RANGE.pivot2) {
            low = Math.min(low, parseFloat(candle.low));
            continue;
        }
        high = Math.max(high, parseFloat(candle.high));
    }

    let dropFromPreviousHighest = ((prevHigh - low) / prevHigh) * 100;
    let riseFromLowestPrice = ((high - low) / low) * 100;

    if (prevHigh === 0 || high === 0 || low === 500000) {
        console.log('\x1b[31m%s\x1b[0m', 'SKIP BECAUSE NOT ENOUGH DATA');
        return;
    }
    results.push({
        Symbol: symbol,
        'Earliest Date': earliestDate.toISOString().split('T')[0],
        'Latest Date': latestDate.toISOString().split('T')[0],
        'Prev High': prevHigh,
        'Lowest': low,
        'After Pivot High': high,
        'Drop from Prev High (%)': -parseFloat(dropFromPreviousHighest.toFixed(2)),
        'Rise from Lowest after Pivot (%)': parseFloat(riseFromLowestPrice.toFixed(2))
    });
}

// Sort results by rise percentage
results.sort((c1, c2) => c2['Rise from Lowest after Pivot (%)'] - c1['Rise from Lowest after Pivot (%)']);

// Export to JSON file
fs.writeFileSync('../visual/data.json', JSON.stringify(results, null, 2));
console.log(`Exported ${results.length} results to visual/data.json`); 