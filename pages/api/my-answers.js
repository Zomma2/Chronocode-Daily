import db from '../../lib/db';
import { withSessionRoute } from '../../lib/session';

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

// Server-side source of truth for "what has this specific user already answered today"
async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const validTracks = ['javascript', 'python', 'node'];
  const track = validTracks.includes(req.query.track) ? req.query.track : 'python';

  if (!req.session?.user) {
    return res.status(200).json({ answers: {} });
  }

  const answers = await db.getAnsweredQuestions(req.session.user.id, track, todayUTC());
  return res.status(200).json({ answers });
}

export default withSessionRoute(handler);
