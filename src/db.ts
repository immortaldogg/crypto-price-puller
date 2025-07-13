import { writeFileSync } from "fs";
import { Parser } from "json2csv";
import Database from "better-sqlite3";
import { DB_PATH } from './config.js';
import { logError } from './logger.js';
import { 
  CandleData, 
  CandleDataExtended, 
  PriceRecord, 
  ExportOptions,
  AnalysisResult
} from './types/types.js';
import { Coin } from './types/coinmarketcapTypes.js';

const db = new Database(DB_PATH);

// Create table if it doesn't exist
db.prepare(`
  CREATE TABLE IF NOT EXISTS prices (
    symbol TEXT,
    open_time INTEGER,
    open TEXT,
    high TEXT,
    low TEXT,
    close TEXT,
    volume TEXT,
    close_time INTEGER,
    PRIMARY KEY (symbol, open_time)
  )
`).run();

// migration? xD
function addColumn(name: string, type: string): void {
    try {
        db.prepare(`ALTER TABLE prices ADD COLUMN ${name} ${type}`).run();
        console.log(`✅ Added ${name} column`);
    } catch (e) {
        console.log(`${name} column already exists`);
    }
}

/*
        "max_supply": 100000000000,
        "circulating_supply": 59131625363,
        "total_supply": 99985946231,
        "infinite_supply": false,
        "platform": null,
        "cmc_rank": 3,
        "self_reported_circulating_supply": null,
        "self_reported_market_cap": null,
        "tvl_ratio": null,
*/

addColumn('cmc_rank', 'INTEGER');
addColumn('max_supply', 'REAL');
addColumn('circulating_supply', 'REAL');
addColumn('total_supply', 'REAL');
addColumn('infinite_supply', 'BOOLEAN');
addColumn('platform', 'TEXT');
addColumn('self_reported_circulating_supply', 'REAL');

const insert = db.prepare(`
  INSERT OR IGNORE INTO prices (symbol, open_time, open, high, low, close, volume, close_time, cmc_rank, max_supply, circulating_supply, total_supply, infinite_supply, platform, self_reported_circulating_supply, self_reported_market_cap, tvl_ratio)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

/**
 * Saves candle data to the database
 * @param symbol - The trading symbol (e.g., 'BTCUSDT')
 * @param rows - Array of candle data rows
 */
export function saveCandles(symbol: string, rows: CandleData[]): void {
    const insertMany = db.transaction((data: CandleData[]) => {
        for (const r of data) {
            // r[0] to r[6] are the original candle data
            // Add default values for new columns
            insert.run(
                symbol, 
                r.open_time, 
                r.open, 
                r.high, 
                r.low, 
                r.close, 
                r.volume, 
                r.close_time,
                null, // cmc_rank
                null, // max_supply
                null, // circulating_supply
                null, // total_supply
                null, // infinite_supply
                null, // platform
                null, // self_reported_circulating_supply
                null, // self_reported_market_cap
                null  // tvl_ratio
            );
            console.log("Inserting candle...");
            console.log(`${new Date(r.open_time).toISOString()} ${r.open} ${r.high} ${r.low} ${r.close} ${r.volume} ${r.close_time}`);
        }
    });
    insertMany(rows);
}

/**
 * Saves extended candle data with additional fields
 * @param symbol - The trading symbol (e.g., 'BTCUSDT')
 * @param rows - Array of extended candle data rows
 */
export function saveCandlesExtended(symbol: string, rows: CandleDataExtended[]): void {
    const insertMany = db.transaction((data: CandleDataExtended[]) => {
        for (const r of data) {
            insert.run(
                symbol,
                r.open_time,
                r.open,
                r.high,
                r.low,
                r.close,
                r.volume,
                r.close_time,
                r.cmc_rank || null,
                r.max_supply || null,
                r.circulating_supply || null,
                r.total_supply || null,
                r.infinite_supply || null,
                r.platform || null,
                r.self_reported_circulating_supply || null,
                r.self_reported_market_cap || null,
                r.tvl_ratio || null
            );
            console.log("Inserting extended candle...");
            console.log(`${new Date(r.open_time).toISOString()} ${r.open} ${r.high} ${r.low} ${r.close} ${r.volume} ${r.close_time}`);
        }
    });
    insertMany(rows);
}

/**
 * Exports data from database to CSV file
 * @param options - Export options
 */
export function exportToCsv(options: ExportOptions): void {
    const db = new Database(options.dbPath);
    const query = `SELECT * FROM ${options.table} ${options.where || ''}`;
    const rows = db.prepare(query).all();

    if (rows.length === 0) {
        console.log("No data found.");
        return;
    }

    const parser = new Parser();
    const csv = parser.parse(rows);
    writeFileSync(options.outFile, csv);
    console.log(`✅ Exported ${rows.length} rows to ${options.outFile}`);
}

/**
 * Gets all unique symbols from the prices table
 * @returns Array of objects containing symbol information
 */
export function getAllSymbols(): { symbol: string }[] {
    const query = `SELECT DISTINCT symbol FROM prices`;
    const rows = db.prepare(query).all();
    return rows as { symbol: string }[];
}

/**
 * Retrieves all candle data for a specific symbol
 * @param symbol - The trading symbol to get data for
 * @returns Array of candle data objects
 */
export function getCandlesBySymbol(symbol: string): PriceRecord[] {
    const query = `SELECT * FROM prices WHERE symbol = ? ORDER BY open_time ASC`;
    const rows = db.prepare(query).all(symbol);
    return rows as PriceRecord[];
}

/**
 * Exports candle data for a specific symbol to CSV format
 * @param symbol - The trading symbol to export
 */
export function exportToCsvBySymbol(symbol: string): void {
    const query = `SELECT symbol, open_time, close_time, open, high, low, close, volume FROM prices WHERE symbol = ? ORDER BY open_time ASC`;
    const rows = db.prepare(query).all(symbol);

    if (rows.length === 0) {
        console.log("No data found.");
        return;
    }

    const parser = new Parser();
    const out_rows = rows.map((row: any) => {
        console.log(row);
        return {
            ...row,
            open_time: new Date(row.open_time).toISOString(),
            close_time: new Date(row.close_time).toISOString()
        };
    });
    
    const csv = parser.parse(out_rows);
    const outFile = `./out/${symbol}`;
    writeFileSync(outFile, csv);
    console.log(`✅ Exported ${out_rows.length} rows of symbol ${symbol} to ${outFile}`);
} 

/**
 * Saves coin data to the database
 * @param coins - Array of coin objects to save
 */
export async function saveCoinsToDatabase(coins: Coin[]): Promise<void> {
    const insertCoin = db.prepare(`
        INSERT OR REPLACE INTO coins (
            id, symbol, name, cmc_rank, price, market_cap, 
            circulating_supply, total_supply, max_supply, 
            infinite_supply, last_updated, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const insertMany = db.transaction((data: Coin[]) => {
        for (const coin of data) {
            const now = new Date().toISOString();
            insertCoin.run(
                coin.id,
                coin.symbol,
                coin.name,
                coin.rank,
                coin.price,
                coin.marketCap,
                coin.circulatingSupply,
                coin.totalSupply,
                coin.maxSupply,
                coin.infiniteSupply,
                coin.lastUpdated,
                now,
                now
            );
        }
    });

    // Create coins table if it doesn't exist
    db.prepare(`
        CREATE TABLE IF NOT EXISTS coins (
            id TEXT PRIMARY KEY,
            symbol TEXT NOT NULL,
            name TEXT NOT NULL,
            cmc_rank INTEGER,
            price REAL,
            market_cap REAL,
            circulating_supply REAL,
            total_supply REAL,
            max_supply REAL,
            infinite_supply BOOLEAN,
            last_updated TEXT,
            created_at TEXT,
            updated_at TEXT
        )
    `).run();

    insertMany(coins);
    console.log(`✅ Saved ${coins.length} coins to database`);
} 