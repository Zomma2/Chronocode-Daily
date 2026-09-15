// Postgres-backed data layer (questions, tips, posts, and per-user daily answers)
import { query, ensureSchema } from './pg';

// Deterministic PRNG so the same seed always produces the same sequence
function mulberry32(seed) {
  let t = seed;
  return function () {
    t += 0x6D2B79F5;
    let r = Math.imul(t ^ (t >>> 15), t | 1);
    r ^= r + Math.imul(r ^ (r >>> 7), r | 61);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

function mapQuestion(row) {
  return {
    ...row,
    options: typeof row.options === 'string' ? JSON.parse(row.options) : row.options,
    difficulty: row.difficulty || 'Medium',
    topic: row.topic || 'General',
  };
}

export async function getQuestionById(id) {
  await ensureSchema();
  const { rows } = await query('SELECT * FROM questions WHERE id = $1', [id]);
  return rows[0] ? mapQuestion(rows[0]) : null;
}

export async function getRandomQuestions(track, count = 4, seed = null, isCommunity = false) {
  await ensureSchema();
  let queryText = 'SELECT * FROM questions WHERE track = $1 AND is_community = $2 ORDER BY id';
  if (isCommunity) {
    queryText = "SELECT * FROM questions WHERE track = $1 AND is_community = $2 AND status = 'approved' ORDER BY id";
  }
  const { rows } = await query(queryText, [track, isCommunity]);
  if (rows.length === 0) return [];

  const rand = seed ? mulberry32(hashString(seed)) : Math.random;
  const shuffled = [...rows].sort(() => 0.5 - rand());
  return shuffled.slice(0, Math.min(count, rows.length)).map(mapQuestion);
}

export async function submitQuestion(data, userId) {
  await ensureSchema();
  const { rows } = await query(
    `INSERT INTO questions (track, question_text, code_snippet, options, correct_index, explanation, is_community, author_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, TRUE, $7, 'pending') RETURNING *`,
    [data.track, data.question_text, data.code_snippet, JSON.stringify(data.options), data.correct_index, data.explanation, userId]
  );
  return mapQuestion(rows[0]);
}

export async function voteQuestion(userId, questionId, voteType) {
  await query(
    `INSERT INTO question_votes (user_id, question_id, vote_type)
     VALUES ($1, $2, $3)
     ON CONFLICT (user_id, question_id) DO UPDATE SET vote_type = EXCLUDED.vote_type`,
    [userId, questionId, voteType]
  );
}

export async function reportQuestion(userId, questionId, reason) {
  await query(
    `INSERT INTO question_reports (user_id, question_id, reason)
     VALUES ($1, $2, $3)`,
    [userId, questionId, reason]
  );
}

export async function getAdminStats() {
  const usersRes = await query('SELECT COUNT(*) as count FROM users');
  const activeTodayRes = await query(`SELECT COUNT(DISTINCT user_id) as count FROM daily_answers WHERE answer_date = CURRENT_DATE`);
  const officialRes = await query('SELECT COUNT(*) as count FROM questions WHERE is_community = FALSE');
  const communityRes = await query('SELECT COUNT(*) as count FROM questions WHERE is_community = TRUE AND status = \'approved\'');
  
  return {
    totalUsers: parseInt(usersRes.rows[0].count),
    activeToday: parseInt(activeTodayRes.rows[0].count),
    officialQuestions: parseInt(officialRes.rows[0].count),
    communityQuestions: parseInt(communityRes.rows[0].count),
  };
}


export async function getAdminUsers() {
  const { rows } = await query('SELECT id, username, email, role, created_at FROM users ORDER BY created_at DESC');
  return rows;
}

export async function getAdminActiveToday() {
  const { rows } = await query(`
    SELECT DISTINCT u.id, u.username, u.email
    FROM daily_answers d
    JOIN users u ON d.user_id = u.id
    WHERE d.answer_date = CURRENT_DATE
  `);
  return rows;
}

export async function getAdminOfficialQuestions() {
  const { rows } = await query('SELECT id, track, question_text, difficulty, topic FROM questions WHERE is_community = FALSE ORDER BY id DESC');
  return rows;
}

export async function getAdminQueues() {
  const pendingRes = await query(`
    SELECT q.*, u.username as author_name 
    FROM questions q 
    LEFT JOIN users u ON q.author_id = u.id 
    WHERE q.status = 'pending' AND q.is_community = TRUE ORDER BY q.created_at DESC
  `);
  
  const reportedRes = await query(`
    SELECT q.*, COUNT(r.id) as report_count 
    FROM questions q 
    JOIN question_reports r ON q.id = r.question_id 
    WHERE q.is_community = TRUE AND q.status = 'approved'
    GROUP BY q.id 
    HAVING COUNT(r.id) > 0 
    ORDER BY report_count DESC
  `);
  
  return {
    pending: pendingRes.rows.map(mapQuestion),
    reported: reportedRes.rows.map(mapQuestion),
  };
}

export async function updateQuestionStatus(id, status) {
  await query('UPDATE questions SET status = $1 WHERE id = $2', [status, id]);
}


export async function getQuestionsByTrack(track, limit = 30) {
  await ensureSchema();
  const { rows } = await query(
    'SELECT * FROM questions WHERE track = $1 ORDER BY id DESC LIMIT $2',
    [track, limit]
  );
  return rows.map(mapQuestion);
}

// Deterministic "tip of the day" - same date+track always resolves to the same tip
// regardless of when the row was inserted (fixes stale exact-date-match lookups).
export async function getTip(track, date) {
  await ensureSchema();
  const { rows } = await query('SELECT * FROM tips WHERE track = $1 ORDER BY id', [track]);
  if (rows.length === 0) return null;
  const rand = mulberry32(hashString(`${date}:tip:${track}`));
  const index = Math.floor(rand() * rows.length);
  return rows[index];
}

export async function getRandomTip(track) {
  await ensureSchema();
  const { rows } = await query('SELECT * FROM tips WHERE track = $1', [track]);
  if (rows.length === 0) return null;
  return rows[Math.floor(Math.random() * rows.length)];
}

export async function getPostBySlug(slug) {
  await ensureSchema();
  const { rows } = await query('SELECT * FROM posts WHERE slug = $1', [slug]);
  return rows[0] || null;
}

export async function getAllPosts() {
  await ensureSchema();
  const { rows } = await query('SELECT * FROM posts ORDER BY published_at DESC');
  return rows;
}

export async function getPostsByTrack(track) {
  await ensureSchema();
  const { rows } = await query('SELECT * FROM posts WHERE track = $1 ORDER BY published_at DESC', [track]);
  return rows;
}

export async function addQuestion(data) {
  await ensureSchema();
  const { rows } = await query(
    `INSERT INTO questions (track, question_text, code_snippet, options, correct_index, explanation)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [data.track, data.question_text, data.code_snippet, JSON.stringify(data.options), data.correct_index, data.explanation]
  );
  return mapQuestion(rows[0]);
}

export async function addTip(data) {
  await ensureSchema();
  const { rows } = await query(
    'INSERT INTO tips (track, tip_text) VALUES ($1, $2) RETURNING *',
    [data.track, data.tip_text]
  );
  return rows[0];
}

export async function addPost(data) {
  await ensureSchema();
  const { rows } = await query(
    `INSERT INTO posts (track, title, slug, excerpt, content) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [data.track, data.title, data.slug, data.excerpt, data.content]
  );
  return rows[0];
}

// --- Per-user daily answers & attempts tracking: analytics + today's progress ---

export async function getAnsweredQuestions(userId, track, date) {
  await ensureSchema();
  const { rows } = await query(
    `SELECT question_id, selected_index, is_correct, correct_index, explanation, response_time_ms, difficulty, topic
     FROM daily_answers WHERE user_id = $1 AND track = $2 AND answer_date = $3`,
    [userId, track, date]
  );
  const answers = {};
  for (const row of rows) {
    answers[row.question_id] = {
      correct: row.is_correct,
      correct_index: row.correct_index,
      explanation: row.explanation,
      selected_index: row.selected_index,
      response_time_ms: row.response_time_ms || 0,
      difficulty: row.difficulty || 'Medium',
      topic: row.topic || 'General',
    };
  }
  return answers;
}

export async function recordAnswer({ userId, questionId, track, date, selectedIndex, isCorrect, correctIndex, explanation, responseTimeMs = 0, difficulty = 'Medium', topic = 'General' }) {
  await ensureSchema();
  const { rows } = await query(
    `INSERT INTO daily_answers (user_id, question_id, track, answer_date, selected_index, is_correct, correct_index, explanation, response_time_ms, difficulty, topic)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
     ON CONFLICT (user_id, question_id, answer_date)
     DO UPDATE SET selected_index = EXCLUDED.selected_index, 
                   is_correct = EXCLUDED.is_correct, 
                   response_time_ms = EXCLUDED.response_time_ms,
                   difficulty = EXCLUDED.difficulty,
                   topic = EXCLUDED.topic,
                   answered_at = now()
     RETURNING *`,
    [userId, questionId, track, date, selectedIndex, isCorrect, correctIndex, explanation, responseTimeMs, difficulty, topic]
  );
  return rows[0];
}

export async function recordAttempt({ userId, questionId, track, chosenAnswer, isCorrect, responseTimeMs = 0, difficulty = 'Medium', topic = 'General', date = null }) {
  await ensureSchema();
  const attemptDate = date || new Date().toISOString().slice(0, 10);
  const { rows } = await query(
    `INSERT INTO answer_attempts (user_id, question_id, track, chosen_answer, is_correct, response_time_ms, difficulty, topic, attempt_date)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [userId, questionId, track, chosenAnswer, isCorrect, responseTimeMs, difficulty, topic, attemptDate]
  );
  return rows[0];
}

export async function getUserAttempts(userId, track = null) {
  await ensureSchema();
  let sql = `
    SELECT a.id, a.user_id, a.question_id, a.track, a.chosen_answer, a.is_correct,
           a.response_time_ms, a.difficulty, a.topic, a.attempt_date, a.created_at,
           q.question_text
    FROM answer_attempts a
    LEFT JOIN questions q ON a.question_id = q.id
    WHERE a.user_id = $1
  `;
  const params = [userId];
  if (track) {
    sql += ' AND a.track = $2';
    params.push(track);
  }
  sql += ' ORDER BY a.created_at DESC';
  const { rows } = await query(sql, params);

  // Fallback to daily_answers if answer_attempts has no entries
  if (rows.length === 0) {
    const { rows: fallbackRows } = await query(
      `SELECT d.id, d.user_id, d.question_id, d.track, d.selected_index AS chosen_answer,
              d.is_correct, d.response_time_ms, d.difficulty, d.topic, d.answer_date AS attempt_date,
              d.answered_at AS created_at, q.question_text
       FROM daily_answers d
       LEFT JOIN questions q ON d.question_id = q.id
       WHERE d.user_id = $1 ${track ? 'AND d.track = $2' : ''}
       ORDER BY d.answered_at DESC`,
      params
    );
    return fallbackRows;
  }

  return rows;
}

export async function getUserStreaks(userId) {
  await ensureSchema();
  const { rows } = await query(
    'SELECT * FROM language_streaks WHERE user_id = $1',
    [userId]
  );
  return rows;
}

export async function clearAnswers(userId, track, date) {
  await ensureSchema();
  await query(
    'DELETE FROM daily_answers WHERE user_id = $1 AND track = $2 AND answer_date = $3',
    [userId, track, date]
  );
}

export default {
  getQuestionById,
  getRandomQuestions,
  getQuestionsByTrack,
  getTip,
  getRandomTip,
  getPostBySlug,
  getAllPosts,
  getPostsByTrack,
  addQuestion,
  addTip,
  addPost,
  getAnsweredQuestions,
  recordAnswer,
  recordAttempt,
  getUserAttempts,
  getUserStreaks,
  clearAnswers,
  submitQuestion,
  voteQuestion,
  reportQuestion,
  getAdminStats,
  getAdminUsers,
  getAdminActiveToday,
  getAdminOfficialQuestions,
  getAdminQueues,
  updateQuestionStatus,
};


