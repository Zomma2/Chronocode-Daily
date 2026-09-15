import db, { getQuestionById } from '../../lib/db';
import { withSessionRoute } from '../../lib/session';
import { updateLanguageStreak } from '../../lib/auth';

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question_id, selected_index, language, response_time_ms } = req.body || {};

  if (!Number.isInteger(question_id) || !Number.isInteger(selected_index)) {
    return res.status(400).json({ error: 'question_id and selected_index must be integers' });
  }

  if (selected_index < 0 || selected_index > 3) {
    return res.status(400).json({ error: 'selected_index must be between 0 and 3' });
  }

  const question = await getQuestionById(question_id);

  if (!question) {
    return res.status(404).json({ error: 'Question not found' });
  }

  const isCorrect = selected_index === question.correct_index;
  // Always trust the question's own track (immune to any client-side track desync)
  const userLanguage = question.track || language || 'unknown';
  const responseTimeMs = Number.isInteger(response_time_ms) && response_time_ms >= 0 ? response_time_ms : 0;
  const difficulty = question.difficulty || 'Medium';
  const topic = question.topic || 'General';

  // Track streak and persist the answer server-side (per user) if logged in
  let streakData = null;
  if (req.session?.user) {
    streakData = await updateLanguageStreak(req.session.user.id, userLanguage, isCorrect);
    await db.recordAnswer({
      userId: req.session.user.id,
      questionId: question_id,
      track: userLanguage,
      date: todayUTC(),
      selectedIndex: selected_index,
      isCorrect,
      correctIndex: question.correct_index,
      explanation: question.explanation,
      responseTimeMs,
      difficulty,
      topic,
    });

    await db.recordAttempt({
      userId: req.session.user.id,
      questionId: question_id,
      track: userLanguage,
      chosenAnswer: selected_index,
      isCorrect,
      responseTimeMs,
      difficulty,
      topic,
    });
  }

  return res.status(200).json({
    correct: isCorrect,
    explanation: question.explanation,
    correct_index: question.correct_index,
    response_time_ms: responseTimeMs,
    difficulty,
    topic,
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
