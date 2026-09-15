import db from '../../lib/db';
import { withSessionRoute } from '../../lib/session';

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!req.session?.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }

  const validTracks = ['javascript', 'python', 'node'];
  const { track } = req.body || {};
  const resolvedTrack = validTracks.includes(track) ? track : 'python';

  await db.clearAnswers(req.session.user.id, resolvedTrack, todayUTC());
  return res.status(200).json({ message: 'Progress reset' });
}

export default withSessionRoute(handler);
