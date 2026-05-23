const Database = require('better-sqlite3');

const db = new Database('bl0xchain.db');

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    balance REAL DEFAULT 0,
    bank REAL DEFAULT 0,
    hashRate REAL DEFAULT 1,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    mined REAL DEFAULT 0,
    rigs INTEGER DEFAULT 1,
    energy INTEGER DEFAULT 100,
    lastMine INTEGER DEFAULT 0
  )
`).run();

module.exports = db;

