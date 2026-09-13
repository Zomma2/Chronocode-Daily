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
    .prepare('SELECT id, track, tip_text, scheduled_date FROM tips WHERE track = ? AND scheduled_date = ?')
    .get(track, date);

  if (!row) {
    return res.status(404).json({ error: 'No tip scheduled for today' });
  }

  return res.status(200).json(row);
}
