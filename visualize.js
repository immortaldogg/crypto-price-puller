import { getAllSymbols, getCandlesBySymbol } from "./db.js";
import chalk from 'chalk';

let pivotRange = {
    start: new Date('2025-04-01'),
    end: new Date('2025-04-30')
}
let symbols = getAllSymbols().map(s => s.symbol);

let results = [];

for (const symbol of symbols) { transformToPresentation(symbol); }
// transformToPresentation('AAVEUSDT');


function transformToPresentation(symbol) {
    const candles = getCandlesBySymbol(symbol);
    // console.log('SYMBOL ', symbol);

    let highestPrice = 0;
    let lowestPrice = 500000;

    let previousHighestPrice = 0;
    let afterPivotHighestPrice = 0;

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

        if (openTime > pivotRange.start) {
            previousHighestPrice = highestPrice;
            afterPivotHighestPrice = Math.max(afterPivotHighestPrice, parseFloat(candle.high));
            lowestPrice = Math.min(lowestPrice, parseFloat(candle.low));
        }
    }

    let dropFromPreviousHighest = ((previousHighestPrice - lowestPrice) / previousHighestPrice) * 100;
    let riseFromLowestPrice = ((afterPivotHighestPrice - lowestPrice) / lowestPrice) * 100;

    results.push({
        Symbol: symbol,
        'Earliest Date': earliestDate.toISOString().split('T')[0],
        'Latest Date': latestDate.toISOString().split('T')[0],
        'Prev High': previousHighestPrice,
        'Lowest': lowestPrice,
        'After Pivot High': afterPivotHighestPrice,
        'Drop from Prev High (%)': parseFloat(dropFromPreviousHighest.toFixed(2)),
        'Rise from Lowest after Pivot (%)': parseFloat(riseFromLowestPrice.toFixed(2))
    });

    // console.log(`${symbol} ${dropFromPreviousHighest}% ${riseFromLowestPrice}%`);
    // console.log('Earliest Date ', earliestDate);
    // console.log('Latest Date ', latestDate);
    // console.log('Previous Highest Price ', previousHighestPrice);
    // if (afterPivotHighestPrice === 0) console.log('\x1b[31m%s\x1b[0m', 'SEOMTHING WRONG');
    // console.log('After Pivot Highest Price ', afterPivotHighestPrice);
    // console.log('Lowest Price ', lowestPrice);
    // console.log('--------------------------------');

    // 2. output to data

}

function makeColoredBar(value, max, length = 20) {
    const barLength = Math.round((value / max) * length);
    return '█'.repeat(barLength) + ' '.repeat(length - barLength);
}

const maxDrop = Math.max(...results.map(r => r['Rise from Lowest after Pivot (%)']));
results.forEach(r => {
    r['Rise Bar'] = makeColoredBar(r['Rise from Lowest after Pivot (%)'], maxDrop);
});

results.sort((c1, c2) => c2['Rise from Lowest after Pivot (%)'] - c1['Rise from Lowest after Pivot (%)']);

console.table(results, [
    'Symbol',
    'Rise Bar',
    'Rise from Lowest after Pivot (%)',
    'Drop from Prev High (%)',
    'Earliest Date',
    'Latest Date',
    'Prev High',
    'Lowest',
    'After Pivot High'
]);