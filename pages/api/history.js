import db from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const track = req.query.track === 'node' ? 'node' : 'python';
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 30, 1), 100);

  // Return all questions from database (archive)
  const allQuestions = await db.getQuestionsByTrack(track, limit);
  const questions = allQuestions.map(q => ({
    id: q.id,
    track: q.track,
    question_text: q.question_text,
    code_snippet: q.code_snippet,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    explanation: q.explanation,
    correct_index: q.correct_index,
  }));

  return res.status(200).json({ track, questions });
}
