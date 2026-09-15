import { getTip } from '../../lib/db';

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const track = req.query.track === 'node' ? 'node' : 'python';
  const date = todayUTC();

  const tip = await getTip(track, date);

  if (!tip) {
    return res.status(404).json({ error: 'No tip scheduled for today' });
  }

  return res.status(200).json(tip);
}
