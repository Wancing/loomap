const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "loomap.db");
console.log("Creating database at:", dbPath);

const db = new Database(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS bathrooms (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT,
    place_description TEXT,
    free_or_paid TEXT DEFAULT 'unknown',
    price_if_known TEXT,
    opening_hours TEXT,
    wheelchair_accessible INTEGER DEFAULT 0,
    step_free_access INTEGER DEFAULT 0,
    baby_changing INTEGER DEFAULT 0,
    gender_neutral INTEGER DEFAULT 0,
    family_friendly INTEGER DEFAULT 0,
    requires_code INTEGER DEFAULT 0,
    code_hint TEXT,
    status TEXT DEFAULT 'pending_review',
    cleanliness_avg REAL DEFAULT 3.5,
    safety_avg REAL DEFAULT 3.5,
    accessibility_avg REAL DEFAULT 3.5,
    trust_score INTEGER DEFAULT 50,
    number_of_confirmations INTEGER DEFAULT 0,
    report_count INTEGER DEFAULT 0,
    last_verified_at TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    source TEXT DEFAULT 'user_submission'
  )
`);

console.log("✅ Database initialized successfully");

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log("Tables in database:", tables);

db.close();
