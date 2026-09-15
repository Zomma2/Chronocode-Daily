import { getPostsByTrack } from '../../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const track = req.query.track || 'python';
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);

  const posts = (await getPostsByTrack(track)).slice(0, limit);

  return res.status(200).json({ track, posts });
}
