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
  const date = todayUTC();

  const row = db
    .prepare(
      'SELECT id, track, question_text, code_snippet, options, scheduled_date FROM questions WHERE track = ? AND scheduled_date = ?'
    )
    .get(track, date);

  if (!row) {
    return res.status(404).json({ error: 'No challenge scheduled for today' });
  }

  // correct_index and explanation are intentionally withheld until /api/verify-answer.
  return res.status(200).json({
    id: row.id,
    track: row.track,
    question_text: row.question_text,
    code_snippet: row.code_snippet,
    options: JSON.parse(row.options),
    scheduled_date: row.scheduled_date,
  });
}
