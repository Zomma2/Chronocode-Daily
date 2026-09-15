import db from '../../lib/db';

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const validTracks = ['javascript', 'python', 'node'];
  const track = validTracks.includes(req.query.track) ? req.query.track : 'python';
  const date = todayUTC();

  // Fetch 4 Official Questions
  const questions = await db.getRandomQuestions(track, 4, `${date}:${track}`, false);
  
  // Fetch 2 Community Questions
  const communityQuestions = await db.getRandomQuestions(track, 2, `${date}:${track}:community`, true);

  if (!questions || questions.length === 0) {
    return res.status(404).json({ error: 'No challenges available for this language' });
  }

  const mapQ = q => ({
    id: q.id,
    track: q.track,
    question_text: q.question_text,
    code_snippet: q.code_snippet,
    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options,
    difficulty: q.difficulty || 'Medium',
    topic: q.topic || 'General',
    is_community: q.is_community || false,
    author_name: q.author_name || null,
  });

  const challenges = questions.map(mapQ);
  const communityChallenges = communityQuestions.map(mapQ);

  return res.status(200).json({
    track,
    questions: challenges,
    communityQuestions: communityChallenges,
    totalQuestions: challenges.length,
    message: 'Answer all 4 questions correctly to increment your daily streak!',
  });
}
