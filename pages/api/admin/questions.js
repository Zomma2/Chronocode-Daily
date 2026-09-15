import db from '../../../lib/db';
import { withSessionRoute } from '../../../lib/session';
import { getUserById } from '../../../lib/auth';

export default withSessionRoute(async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  const sessionUser = req.session.user;
  if (!sessionUser) return res.status(401).json({ error: 'Unauthorized' });
  
  const user = await getUserById(sessionUser.id);
  if (user.role !== 'admin') return res.status(403).json({ error: 'Forbidden' });

  const { id, action } = req.body;
  if (!id || !action) return res.status(400).json({ error: 'Missing parameters' });

  try {
    let newStatus = 'pending';
    if (action === 'approve') newStatus = 'approved';
    if (action === 'reject') newStatus = 'rejected';
    if (action === 'suspend') newStatus = 'suspended';

    await db.updateQuestionStatus(id, newStatus);
    res.status(200).json({ success: true, status: newStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
