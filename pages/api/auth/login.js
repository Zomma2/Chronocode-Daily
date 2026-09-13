import { withSessionRoute } from '../../../lib/session';
import { authenticateUser } from '../../../lib/auth';

async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    try {
      const user = await authenticateUser(email, password);

      if (!user) {
        return res.status(401).json({ error: 'Invalid email or password' });
      }

      // Set session
      req.session.user = user;

      return res.status(200).json({
        message: 'Logged in successfully',
        user,
      });
    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ error: 'Login failed' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withSessionRoute(handler);
