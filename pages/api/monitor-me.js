import { withSessionRoute } from '../../lib/session';
import db from '../../lib/db';
import { calculateAnalytics } from '../../lib/analytics';

async function handler(req, res) {
  const { track } = req.query;

  if (req.method === 'GET') {
    if (!req.session?.user) {
      // Return empty baseline for unauthenticated users (client will merge with localStorage)
      return res.status(200).json({
        authenticated: false,
        analytics: calculateAnalytics([], []),
      });
    }

    try {
      const userId = req.session.user.id;
      const [attempts, streaks] = await Promise.all([
        db.getUserAttempts(userId, track || null),
        db.getUserStreaks(userId),
      ]);

      const analytics = calculateAnalytics(attempts, streaks);

      return res.status(200).json({
        authenticated: true,
        user: {
          id: req.session.user.id,
          username: req.session.user.username,
        },
        analytics,
      });
    } catch (err) {
      console.error('Failed to compute analytics:', err);
      return res.status(500).json({ error: 'Failed to compute analytics' });
    }
  }

  // Allow client to send offline/guest attempts to calculate metrics
  if (req.method === 'POST') {
    const { attempts = [], streaks = [] } = req.body || {};
    const analytics = calculateAnalytics(attempts, streaks);
    return res.status(200).json({
      authenticated: Boolean(req.session?.user),
      analytics,
    });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).json({ error: 'Method not allowed' });
}

export default withSessionRoute(handler);
