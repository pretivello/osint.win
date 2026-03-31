const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./osint.db");

db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS scans (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT,
            target TEXT,
            result TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
});

module.exports = db;