import bcrypt from 'bcryptjs';
import { query, ensureSchema } from './pg';

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function initializeUserTables() {
  return ensureSchema();
}

export async function createUser(email, username, password, avatarConfig = null) {
  await ensureSchema();

  if (await getUserByEmail(email)) {
    throw new Error('Email already exists');
  }
  if (await getUserByUsername(username)) {
    throw new Error('Username already exists');
  }

  const passwordHash = await hashPassword(password);
  const config = avatarConfig || { sex: 'man' };

  const { rows } = await query(
    `INSERT INTO users (email, username, password_hash, avatar_config, avatar_visible)
     VALUES ($1, $2, $3, $4, TRUE) RETURNING id, email, username, avatar_config, avatar_visible`,
    [email, username, passwordHash, JSON.stringify(config)]
  );

  return rows[0];
}

export async function getUserByEmail(email) {
  await ensureSchema();
  const { rows } = await query('SELECT * FROM users WHERE email = $1', [email]);
  return rows[0] || null;
}

export async function getUserByUsername(username) {
  await ensureSchema();
  const { rows } = await query('SELECT * FROM users WHERE username = $1', [username]);
  return rows[0] || null;
}

export async function getUserById(id) {
  await ensureSchema();
  const { rows } = await query('SELECT * FROM users WHERE id = $1', [id]);
  if (!rows[0]) return null;
  const { password_hash, ...safeUser } = rows[0];
  return safeUser;
}

export async function authenticateUser(email, password) {
  const user = await getUserByEmail(email);
  if (!user) return null;

  const isValid = await verifyPassword(password, user.password_hash);
  if (!isValid) return null;

  return {
    id: user.id,
    email: user.email,
    username: user.username,
    avatar_config: user.avatar_config || { sex: 'man' },
    avatar_visible: user.avatar_visible !== false,
    role: user.role,
  };
}

export async function getLanguageStreak(userId, language) {
  await ensureSchema();
  const { rows } = await query(
    'SELECT * FROM language_streaks WHERE user_id = $1 AND language = $2',
    [userId, language]
  );
  return rows[0] || null;
}

export async function updateLanguageStreak(userId, language, isCorrect) {
  await ensureSchema();
  const today = new Date().toISOString().split('T')[0];

  const existing = await getLanguageStreak(userId, language);

  let questionsAnsweredToday = existing?.questions_answered_today || 0;
  let currentStreak = existing?.current_streak || 0;
  let bestStreak = existing?.best_streak || 0;

  const lastAnsweredDate = existing?.last_answered_date
    ? new Date(existing.last_answered_date).toISOString().split('T')[0]
    : null;
  const isNewDay = !lastAnsweredDate || lastAnsweredDate !== today;

  if (isNewDay) {
    questionsAnsweredToday = 0;
  }

  let streakIncremented = false;
  questionsAnsweredToday += 1; // Increment for any attempt
  if (isCorrect) {
    currentStreak += 1;
    streakIncremented = true;
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }
  } else {
    currentStreak = 0;
  }

  await query(
    `INSERT INTO language_streaks (user_id, language, questions_answered_today, current_streak, best_streak, last_answered_date, updated_at)
     VALUES ($1, $2, $3, $4, $5, $6, now())
     ON CONFLICT (user_id, language)
     DO UPDATE SET questions_answered_today = EXCLUDED.questions_answered_today,
                   current_streak = EXCLUDED.current_streak,
                   best_streak = EXCLUDED.best_streak,
                   last_answered_date = EXCLUDED.last_answered_date,
                   updated_at = now()`,
    [userId, language, questionsAnsweredToday, currentStreak, bestStreak, today]
  );

  return {
    questionsAnsweredToday,
    currentStreak,
    bestStreak,
    streakIncremented,
  };
}

export async function getUserStats(userId) {
  await ensureSchema();

  const { rows: languageStreaksList } = await query(
    'SELECT * FROM language_streaks WHERE user_id = $1',
    [userId]
  );

  const { rows: totals } = await query(
    `SELECT COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_correct)::int AS correct
     FROM daily_answers WHERE user_id = $1`,
    [userId]
  );

  const { rows: questionCountsRows } = await query(
    `SELECT track, COUNT(*)::int as count FROM questions GROUP BY track`
  );
  
  const questionCounts = { overall: 0, python: 0, node: 0 };
  questionCountsRows.forEach(row => {
    questionCounts[row.track] = row.count;
    questionCounts.overall += row.count;
  });

  return {
    languageStreaks: languageStreaksList,
    totalAnswered: totals[0].total,
    correctAnswers: totals[0].correct,
    questionCounts,
  };
}
