import db from '../../../lib/db';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const track = req.query.track || 'python';
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const rows = db
    .prepare(
      'SELECT id, slug, title, excerpt, track, published_at, updated_at FROM posts WHERE track = ? ORDER BY published_at DESC LIMIT ?'
    )
    .all(track, limit);

  return res.status(200).json({ track, posts: rows });
}
