import { withSessionRoute } from '@/lib/session';
import { createUser, authenticateUser, getUserByEmail, getUserByUsername } from '@/lib/auth';

async function handler(req, res) {
  if (req.method === 'POST') {
    const { email, username, password, confirmPassword } = req.body;

    // Validation
    if (!email || !username || !password || !confirmPassword) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: 'Passwords do not match' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters' });
    }

    if (username.length < 3) {
      return res.status(400).json({ error: 'Username must be at least 3 characters' });
    }

    // Check if user exists
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Username already taken' });
    }

    try {
      const user = await createUser(email, username, password);
      
      // Set session
      req.session.user = {
        id: user.id,
        email: user.email,
        username: user.username,
      };
      await req.session.save();

      return res.status(201).json({
        message: 'Account created successfully',
        user: req.session.user,
      });
    } catch (error) {
      console.error('Signup error:', error);
      return res.status(500).json({ error: 'Failed to create account' });
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}

export default withSessionRoute(handler);
