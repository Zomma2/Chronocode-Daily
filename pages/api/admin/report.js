import db from '../../../lib/db';
import { withSessionRoute } from '../../../lib/session';

export default withSessionRoute(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const user = req.session.user;
  if (!user) return res.status(401).json({ error: 'Unauthorized' });

  const { questionId, reason } = req.body;
  if (!questionId || !reason) return res.status(400).json({ error: 'Missing parameters' });

  try {
    await db.reportQuestion(user.id, questionId, reason);
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
