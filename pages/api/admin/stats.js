import db from '../../../lib/db';
import { withSessionRoute } from '../../../lib/session';
import { getUserById } from '../../../lib/auth';

export default withSessionRoute(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });
  
  // Must be admin
  const userFull = await getUserById(user.id);
  if (userFull.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  try {
    const stats = await db.getAdminStats();
    res.status(200).json(stats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
