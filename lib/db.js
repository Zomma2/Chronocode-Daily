import path from 'path';
import fs from 'fs';
import Database from 'better-sqlite3';

const DATA_DIR = process.env.DATABASE_DIR || path.join(process.cwd(), 'data');
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'codebits.db');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track TEXT NOT NULL,
    question_text TEXT NOT NULL,
    code_snippet TEXT,
    options TEXT NOT NULL,
    correct_index INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    scheduled_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track TEXT NOT NULL,
    tip_text TEXT NOT NULL,
    scheduled_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    track TEXT NOT NULL,
    published_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_questions_track_date ON questions (track, scheduled_date);
  CREATE INDEX IF NOT EXISTS idx_tips_track_date ON tips (track, scheduled_date);
  CREATE INDEX IF NOT EXISTS idx_posts_track_published ON posts (track, published_at);
`;

// Reuse a single connection across hot-reloads / serverless invocations in dev.
const globalForDb = globalThis;

function createConnection() {
  const connection = new Database(DB_PATH);
  connection.pragma('journal_mode = WAL');
  connection.exec(SCHEMA);
  return connection;
}

const db = globalForDb._codebitsDb || createConnection();

if (process.env.NODE_ENV !== 'production') {
  globalForDb._codebitsDb = db;
}

export default db;
