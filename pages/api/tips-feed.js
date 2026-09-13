export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const track = req.query.track === 'node' ? 'node' : 'python';
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 8, 1), 20);

  // Return sample tips
  const tips = [
    {
      id: 1,
      track,
      tip_text: 'Use const by default in JavaScript to avoid unexpected mutations.',
      scheduled_date: new Date().toISOString().split('T')[0],
    },
    {
      id: 2,
      track,
      tip_text: 'Always handle errors in async/await functions with try-catch blocks.',
      scheduled_date: new Date().toISOString().split('T')[0],
    },
  ].slice(0, limit);

  return res.status(200).json({ track, tips });
}
