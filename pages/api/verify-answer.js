import db from '../../lib/db';
import { withSessionRoute } from '@/lib/session';
import { updateLanguageStreak, getLanguageStreak } from '@/lib/auth';

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question_id, selected_index, language } = req.body || {};

  if (!Number.isInteger(question_id) || !Number.isInteger(selected_index)) {
    return res.status(400).json({ error: 'question_id and selected_index must be integers' });
  }

  if (selected_index < 0 || selected_index > 3) {
    return res.status(400).json({ error: 'selected_index must be between 0 and 3' });
  }

  const row = db
    .prepare('SELECT correct_index, explanation FROM questions WHERE id = ?')
    .get(question_id);

  if (!row) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const isCorrect = selected_index === row.correct_index;

  // Track streak if user is logged in
  let streakData = null;
  if (req.session.user) {
    const userLanguage = language || 'unknown';
    streakData = updateLanguageStreak(req.session.user.id, userLanguage, isCorrect);
  }

  return res.status(200).json({
    correct: isCorrect,
    explanation: row.explanation,
    correct_index: row.correct_index,
    ...(streakData && {
      streak: {
        questionsAnsweredToday: streakData.questionsAnsweredToday,
        currentStreak: streakData.currentStreak,
        bestStreak: streakData.bestStreak,
        streakIncremented: streakData.streakIncremented,
      },
    }),
  });
}

export default withSessionRoute(handler);
