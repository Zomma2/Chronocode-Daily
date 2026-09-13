import bcrypt from 'bcryptjs';
import Database from 'better-sqlite3';
import path from 'path';

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'data', 'app.db');
let db;

function getDb() {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
  }
  return db;
}

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function initializeUserTables() {
  const database = getDb();
  
  // Users table
  database.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
  `);

  // User streaks table
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL UNIQUE,
      current_streak INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      total_questions_answered INTEGER DEFAULT 0,
      last_answered_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_streaks_user ON user_streaks(user_id);
  `);

  // Language streaks table (per language tracking)
  database.exec(`
    CREATE TABLE IF NOT EXISTS language_streaks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      language TEXT NOT NULL,
      questions_answered_today INTEGER DEFAULT 0,
      current_streak INTEGER DEFAULT 0,
      best_streak INTEGER DEFAULT 0,
      last_answered_date DATE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(user_id, language),
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_lang_streaks_user ON language_streaks(user_id);
    CREATE INDEX IF NOT EXISTS idx_lang_streaks_language ON language_streaks(language);
  `);

  // User answers history
  database.exec(`
    CREATE TABLE IF NOT EXISTS user_answers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      challenge_id INTEGER,
      language TEXT,
      is_correct BOOLEAN,
      answered_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_answers_user ON user_answers(user_id);
    CREATE INDEX IF NOT EXISTS idx_answers_date ON user_answers(answered_at);
  `);
}

export async function createUser(email, username, password) {
  const database = getDb();
  
  try {
    const passwordHash = await hashPassword(password);
    
    const stmt = database.prepare(`
      INSERT INTO users (email, username, password_hash)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(email, username, passwordHash);
    
    // Initialize streak record for new user
    const streakStmt = database.prepare(`
      INSERT INTO user_streaks (user_id, current_streak, best_streak)
      VALUES (?, 0, 0)
    `);
    streakStmt.run(result.lastInsertRowid);
    
    return {
      id: result.lastInsertRowid,
      email,
      username,
    };
  } catch (error) {
    throw new Error(error.message);
  }
}

export async function getUserByEmail(email) {
  const database = getDb();
  
  const stmt = database.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email);
}

export async function getUserByUsername(username) {
  const database = getDb();
  
  const stmt = database.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
}

export async function getUserById(id) {
  const database = getDb();
  
  const stmt = database.prepare('SELECT id, email, username, created_at FROM users WHERE id = ?');
  return stmt.get(id);
}

export async function authenticateUser(email, password) {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  const isValid = await verifyPassword(password, user.password_hash);
  
  if (!isValid) {
    return null;
  }
  
  return {
    id: user.id,
    email: user.email,
    username: user.username,
  };
}

export function getUserStreak(userId) {
  const database = getDb();
  
  const stmt = database.prepare(`
    SELECT * FROM user_streaks WHERE user_id = ?
  `);
  
  return stmt.get(userId);
}

export function getLanguageStreak(userId, language) {
  const database = getDb();
  
  const stmt = database.prepare(`
    SELECT * FROM language_streaks 
    WHERE user_id = ? AND language = ?
  `);
  
  return stmt.get(userId, language);
}

export function updateLanguageStreak(userId, language, isCorrect) {
  const database = getDb();
  const today = new Date().toISOString().split('T')[0];
  
  // Get or create language streak record
  let streak = getLanguageStreak(userId, language);
  
  if (!streak) {
    const insertStmt = database.prepare(`
      INSERT INTO language_streaks (user_id, language, questions_answered_today, current_streak, best_streak)
      VALUES (?, ?, 0, 0, 0)
    `);
    insertStmt.run(userId, language);
    streak = getLanguageStreak(userId, language);
  }
  
  let questionsAnsweredToday = streak.questions_answered_today || 0;
  let currentStreak = streak.current_streak || 0;
  let bestStreak = streak.best_streak || 0;
  
  // Check if it's a new day
  const lastAnsweredDate = streak.last_answered_date;
  const isNewDay = !lastAnsweredDate || lastAnsweredDate !== today;
  
  if (isNewDay) {
    questionsAnsweredToday = 0;
  }
  
  if (isCorrect) {
    questionsAnsweredToday += 1;
    
    // Update streak if 4 correct answers in a day (4 questions per language requirement)
    if (questionsAnsweredToday % 4 === 0) {
      currentStreak += 1;
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }
    }
  } else {
    // Reset streak on wrong answer
    currentStreak = 0;
  }
  
  const updateStmt = database.prepare(`
    UPDATE language_streaks 
    SET questions_answered_today = ?, 
        current_streak = ?, 
        best_streak = ?,
        last_answered_date = ?,
        updated_at = CURRENT_TIMESTAMP
    WHERE user_id = ? AND language = ?
  `);
  
  updateStmt.run(questionsAnsweredToday, currentStreak, bestStreak, today, userId, language);
  
  // Record the answer
  const answerStmt = database.prepare(`
    INSERT INTO user_answers (user_id, language, is_correct, answered_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `);
  answerStmt.run(userId, language, isCorrect ? 1 : 0);
  
  return {
    questionsAnsweredToday,
    currentStreak,
    bestStreak,
    streakIncremented: isCorrect && questionsAnsweredToday % 4 === 0,
  };
}

export function getUserStats(userId) {
  const database = getDb();
  
  // Get all language streaks for user
  const langStmt = database.prepare(`
    SELECT language, current_streak, best_streak, questions_answered_today
    FROM language_streaks 
    WHERE user_id = ?
  `);
  
  const languageStreaks = langStmt.all(userId);
  
  // Get total stats
  const statsStmt = database.prepare(`
    SELECT 
      COUNT(*) as total_answered,
      SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct_answers,
      MAX(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as last_correct
    FROM user_answers
    WHERE user_id = ?
  `);
  
  const stats = statsStmt.get(userId);
  
  return {
    languageStreaks,
    totalAnswered: stats.total_answered || 0,
    correctAnswers: stats.correct_answers || 0,
  };
}
