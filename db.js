import sqlite3 from "sqlite3";

const db = new sqlite3.Database("./users.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT,
      email TEXT UNIQUE,
      password TEXT,
      otp TEXT,
      isVerified INTEGER DEFAULT 0
    )
  `);
});

export default db;
