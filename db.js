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
      phone INTEGER,
      location TEXT,
      about TEXT,
      isVerified INTEGER DEFAULT 0
    )
  `);

    // 2. TRIPS
  db.run(`
    CREATE TABLE IF NOT EXISTS trips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_public INTEGER DEFAULT 0,
      share_token TEXT UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // 3. CITIES
  db.run(`
    CREATE TABLE IF NOT EXISTS cities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      country TEXT NOT NULL,
      cost_index INTEGER,
      popularity_score INTEGER
    )
  `);

  
  // 4. STOPS
  db.run(`
    CREATE TABLE IF NOT EXISTS stops (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      city_id INTEGER,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      position INTEGER NOT NULL,
      description TEXT,
      budget INTEGER DEFAULT 0,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
      FOREIGN KEY (city_id) REFERENCES cities(id)
    )
  `);

  // 5. ACTIVITIES
  db.run(`
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      city_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      category TEXT,
      avg_cost INTEGER,
      duration_hours REAL,
      description TEXT,
      FOREIGN KEY (city_id) REFERENCES cities(id)
    )
  `);

  
  // 6. STOP_ACTIVITIES
  db.run(`
    CREATE TABLE IF NOT EXISTS stop_activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      stop_id INTEGER NOT NULL,
      activity_id INTEGER NOT NULL,
      scheduled_date DATE,
      custom_cost INTEGER,
      FOREIGN KEY (stop_id) REFERENCES stops(id) ON DELETE CASCADE,
      FOREIGN KEY (activity_id) REFERENCES activities(id)
    )
  `);

  // 7. BUDGET OVERRIDES
  db.run(`
    CREATE TABLE IF NOT EXISTS trip_budget_overrides (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trip_id INTEGER NOT NULL,
      category TEXT,
      amount INTEGER,
      FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
    )
  `);

});

export default db;
