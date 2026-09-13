import db from '../../lib/db';

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

export default function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const validTracks = ['javascript', 'python', 'node'];
  const track = validTracks.includes(req.query.track) ? req.query.track : 'python';

  // Get 4 random questions for the language
  const questions = db.getRandomQuestions(track, 4);

  if (!questions || questions.length === 0) {
    return res.status(404).json({ error: 'No challenges available for this language' });
  }

  // Return questions without revealing correct answers
  const challenge = questions.map(q => ({
    id: q.id,
    track: q.track,
    question_text: q.question_text,
    code_snippet: q.code_snippet,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
  }));

  return res.status(200).json({
    track,
    questions: challenge,
    totalQuestions: challenge.length,
    message: 'Answer all 4 questions correctly to increment your daily streak!',
  });
}
