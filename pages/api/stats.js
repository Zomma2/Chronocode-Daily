import { query, ensureSchema } from '../../lib/pg';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    await ensureSchema();
    const { rows: questionCountsRows } = await query(
      `SELECT track, COUNT(*)::int as count FROM questions GROUP BY track`
    );
    
    const counts = { overall: 0, python: 0, node: 0 };
    questionCountsRows.forEach(row => {
      counts[row.track] = row.count;
      counts.overall += row.count;
    });

    res.status(200).json({ counts });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
}
