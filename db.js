import { writeFileSync } from "fs";
import { Parser } from "json2csv";
import Database from "better-sqlite3";

const DB_PATH = "binance_prices.db";

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

export function saveCandles(symbol, rows) {
    const insertMany = db.transaction((data) => {
        for (const r of data) {
            insert.run(symbol, r[0], r[1], r[2], r[3], r[4], r[5], r[6]);
        }
    });
    insertMany(rows);
}

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

// function ensureFolderExists(filePath) {
//     const dir = path.dirname(filePath);
//     if (!fs.existsSync(dir)) {
//         fs.mkdirSync(dir, { recursive: true });
//     }
// }

export function exportToCsvBySymbol(symbol) {
    const query = `SELECT symbol, open_time, close_time, open, high, low, close, volume FROM prices WHERE symbol = '${symbol}'`;
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