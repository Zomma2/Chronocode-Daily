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
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 20);
  const date = todayUTC();

  const rows = db
    .prepare(
      'SELECT id, track, tip_text, scheduled_date FROM tips WHERE track = ? AND scheduled_date <= ? ORDER BY scheduled_date DESC LIMIT ?'
    )
    .all(track, date, limit);

  return res.status(200).json({ track, tips: rows });
}
