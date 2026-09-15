import { withSessionRoute } from '../../../lib/session';
import { getUserStats, getUserById } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method === 'GET') {
    if (!req.session.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    try {
      const stats = await getUserStats(req.session.user.id);
      const fullUser = await getUserById(req.session.user.id);
      req.session.user = { ...req.session.user, role: fullUser?.role };
      await req.session.save();
      return res.status(200).json({
        user: req.session.user,
        stats,
      });
    } catch (error) {
      console.error('Session error:', error);
      return res.status(500).json({ error: 'Failed to fetch user data' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withSessionRoute(handler);
