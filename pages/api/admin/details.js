import db from '../../../lib/db';
import { withSessionRoute } from '../../../lib/session';
import { getUserById } from '../../../lib/auth';

export default withSessionRoute(async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
  
  const sessionUser = req.session.user;
  if (!sessionUser) return res.status(401).json({ error: 'Unauthorized' });
  
  const user = await getUserById(sessionUser.id);
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  try {
    const users = await db.getAdminUsers();
    const activeToday = await db.getAdminActiveToday();
    const officialQuestions = await db.getAdminOfficialQuestions();
    
    res.status(200).json({
      users,
      activeToday,
      officialQuestions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
