import { writeFileSync } from "fs";
import { Parser } from "json2csv";
import Database from "better-sqlite3";
import { DB_PATH } from './config.js';

const db = new Database(DB_PATH);

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

const insert = db.prepare(`
  INSERT OR IGNORE INTO prices (symbol, open_time, open, high, low, close, volume, close_time)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?)
`);

/**
 * Saves candle data to the database
 * @param {string} symbol - The trading symbol (e.g., 'BTCUSDT')
 * @param {Array} rows - Array of candle data rows
 */
export function saveCandles(symbol, rows) {
    const insertMany = db.transaction((data) => {
        for (const r of data) {
            insert.run(symbol, r[0], r[1], r[2], r[3], r[4], r[5], r[6]);
            console.log("Inserting candle...");
            console.log(`${new Date(parseInt(r[0])).toISOString()} ${r[1]} ${r[2]} ${r[3]} ${r[4]} ${r[5]} ${r[6]}`);
        }
    });
    insertMany(rows);
}

/**
 * Exports data from database to CSV file
 * @param {Object} options - Export options
 * @param {string} options.dbPath - Path to the database file
 * @param {string} options.table - Table name to export
 * @param {string} options.outFile - Output CSV file path
 * @param {string} [options.where] - Optional WHERE clause for filtering
 */
export function exportToCsv({ dbPath, table, outFile, where = "" }) {
    const db = new Database(dbPath);
    const query = `SELECT * FROM ${table} ${where}`;
    const rows = db.prepare(query).all();

    if (rows.length === 0) {
        console.log("No data found.");
        return;
    }

    const parser = new Parser();
    const csv = parser.parse(rows);
    writeFileSync(outFile, csv);
    console.log(`✅ Exported ${rows.length} rows to ${outFile}`);
}

/**
 * Gets all unique symbols from the prices table
 * @returns {Array} Array of objects containing symbol information
 */
export function getAllSymbols() {
    const query = `SELECT DISTINCT symbol FROM prices`;
    const rows = db.prepare(query).all();
    return rows;
}

/**
 * Retrieves all candle data for a specific symbol
 * @param {string} symbol - The trading symbol to get data for
 * @returns {Array} Array of candle data objects
 */
export function getCandlesBySymbol(symbol) {
    const query = `SELECT * FROM prices WHERE symbol = '${symbol}' ORDER BY open_time ASC`;
    const rows = db.prepare(query).all();
    return rows;
}

/**
 * Exports candle data for a specific symbol to CSV format
 * @param {string} symbol - The trading symbol to export
 */
export function exportToCsvBySymbol(symbol) {
    const query = `SELECT symbol, open_time, close_time, open, high, low, close, volume FROM prices WHERE symbol = '${symbol}' ORDER BY open_time ASC`;
    const rows = db.prepare(query).all();

    if (rows.length === 0) {
        console.log("No data found.");
        return;
    }

    const parser = new Parser();
    const out_rows = rows.map(row => {
        console.log(row);
        row.open_time = (new Date(row.open_time)).toISOString();
        row.close_time = (new Date(row.close_time)).toISOString();
        return row;
    })
    const csv = parser.parse(out_rows);
    const outFile = `./out/${symbol}`;
    writeFileSync(outFile, csv);
    console.log(`✅ Exported ${out_rows.length} rows of symbol ${symbol} to ${outFile}`);
}