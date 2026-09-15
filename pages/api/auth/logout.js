import { withSessionRoute } from '../../../lib/session';

async function handler(req, res) {
  if (req.method === 'POST') {
    try {
      req.session.user = null;
      return res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
      console.error('Logout error:', error);
      return res.status(500).json({ error: 'Logout failed' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withSessionRoute(handler);
