export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // This endpoint requires authentication
  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  // Return empty history for now
  return res.status(200).json([]);
}
