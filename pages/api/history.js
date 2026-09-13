import db from '../../lib/db';

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const track = req.query.track === 'node' ? 'node' : 'python';
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);
  const date = todayUTC();

  const rows = db
    .prepare(
      `SELECT id, track, question_text, code_snippet, options, correct_index, explanation, scheduled_date
       FROM questions WHERE track = ? AND scheduled_date <= ? ORDER BY scheduled_date DESC LIMIT ?`
    )
    .all(track, date, limit);

  return res.status(200).json({
    track,
    questions: rows.map((row) => ({ ...row, options: JSON.parse(row.options) })),
  });
}
