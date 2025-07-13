import { getAllSymbols, getCandlesBySymbol } from "./db.js";
import fs from 'fs';

let pivotRange = {
    pivot1: new Date('2024-11-01'),
    pivot2: new Date('2025-03-01'),
    pivot3: new Date('2025-04-30'),
    prevHighRange: new Date('2024-11-01'),
    prevHighRangeEnd: new Date('2025-03-01'),
    start: new Date('2025-01-01'),
    end: new Date('2025-04-30'),
    pivotLow: new Date('2025-01-01')
}
let symbols = getAllSymbols().map(s => s.symbol);

let results = [];

for (const symbol of symbols) { 
    // if (symbol !== 'FARTCOINUSDT') continue;
    // if (symbol === 'ABUSDT') continue;
    transformToPresentation(symbol); 
}

function transformToPresentation(symbol) {
    const candles = getCandlesBySymbol(symbol);

    let highestPrice = 0;
    let lowestPrice = 500000;

    let previousHighestPrice = 0;
    let afterPivotHighestPrice = 0;

    if (candles.length <= 1) {
        console.log('\x1b[31m%s\x1b[0m', 'SKIP BECAUSE NOT ENOUGH CANDLES');
        return;
    }

    let earliestDate = new Date(candles[1].open_time);
    let latestDate = new Date(candles[candles.length - 1].open_time);

    // filter out bad data - if earliest date is before pivot range, skip
    if (earliestDate > pivotRange.start) {
        console.log('\x1b[31m%s\x1b[0m', 'SKIP BECAUSE EARLIEST DATE IS BEFORE PIVOT RANGE');
        return;
    }

    // filter out bad data - if coins get delisted
    if (latestDate < pivotRange.end) {
        console.log('\x1b[31m%s\x1b[0m', 'SKIP BECAUSE LATEST DATE IS BEFORE PIVOT RANGE');
        return;
    }

    for (let i = 1; i < candles.length; i++) {
        const candle = candles[i];

        const openTime = new Date(candle.open_time);
        if (openTime <= pivotRange.start) {
            highestPrice = Math.max(highestPrice, parseFloat(candle.high));
        }

        if (openTime > pivotRange.end) {
            previousHighestPrice = highestPrice;
            afterPivotHighestPrice = Math.max(afterPivotHighestPrice, parseFloat(candle.high));
            lowestPrice = Math.min(lowestPrice, Math.min(parseFloat(candle.open), parseFloat(candle.close)));
        }
    }

    let dropFromPreviousHighest = ((previousHighestPrice - lowestPrice) / previousHighestPrice) * 100;
    let riseFromLowestPrice = ((afterPivotHighestPrice - lowestPrice) / lowestPrice) * 100;

    if (previousHighestPrice === 0 || afterPivotHighestPrice === 0 || lowestPrice === 500000) {
        console.log('\x1b[31m%s\x1b[0m', 'SKIP BECAUSE NOT ENOUGH DATA');
        return;
    }
    results.push({
        Symbol: symbol,
        'Earliest Date': earliestDate.toISOString().split('T')[0],
        'Latest Date': latestDate.toISOString().split('T')[0],
        'Prev High': previousHighestPrice,
        'Lowest': lowestPrice,
        'After Pivot High': afterPivotHighestPrice,
        'Drop from Prev High (%)': -parseFloat(dropFromPreviousHighest.toFixed(2)),
        'Rise from Lowest after Pivot (%)': parseFloat(riseFromLowestPrice.toFixed(2))
    });
}

// Sort results by rise percentage
results.sort((c1, c2) => c2['Rise from Lowest after Pivot (%)'] - c1['Rise from Lowest after Pivot (%)']);

// Export to JSON file
fs.writeFileSync('../visual/data.json', JSON.stringify(results, null, 2));
console.log(`Exported ${results.length} results to visual/data.json`); 