import db from '../../../lib/db';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { slug } = req.query;

  if (!slug || typeof slug !== 'string') {
    return res.status(400).json({ error: 'slug is required' });
  }

  const row = db.prepare('SELECT * FROM posts WHERE slug = ?').get(slug);

  if (!row) {
    return res.status(404).json({ error: 'Post not found' });
  }

  return res.status(200).json(row);
}
