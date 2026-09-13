import db from '../../lib/db';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { question_id, selected_index } = req.body || {};

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

  return res.status(200).json({
    correct: selected_index === row.correct_index,
    explanation: row.explanation,
    correct_index: row.correct_index,
  });
}
