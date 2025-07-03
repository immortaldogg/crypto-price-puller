const Database = require("better-sqlite3");
const db = new Database("binance_prices.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS prices (
    symbol TEXT,
    open_time INTEGER,
    open TEXT,
    high TEXT,
    low TEXT,
    close TEXT,
    volume TEXT,
    PRIMARY KEY (symbol, open_time)
  )
`).run();

const insert = db.prepare(`
  INSERT OR IGNORE INTO prices (symbol, open_time, open, high, low, close, volume)
  VALUES (?, ?, ?, ?, ?, ?, ?)
`);

function saveCandles(symbol, rows) {
    const insertMany = db.transaction((data) => {
        for (const r of data) {
            insert.run(symbol, r[0], r[1], r[2], r[3], r[4], r[5]);
        }
    });
    insertMany(rows);
}

module.exports = { saveCandles };
