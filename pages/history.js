import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import CodeBlock from '../components/CodeBlock';

export default function HistoryPage() {
  const [track, setTrack] = useState('python');
  const [questions, setQuestions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setQuestions(null);
    setError(null);

    fetch(`/api/history?track=${track}&limit=30`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load archive');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setQuestions(data.questions);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [track]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200">
            ← Back to today
          </Link>
          <h1 className="text-lg font-bold text-white">Archive</h1>
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setTrack('python')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
                track === 'python' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setTrack('node')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
                track === 'node' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Node.js
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12 space-y-10">
        {error && <div className="text-rose-400">{error}</div>}

        {!questions && !error && (
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton animate-shimmer h-40 rounded-xl" />
            ))}
          </div>
        )}

        {questions && questions.length === 0 && <p className="text-zinc-500">No archived challenges yet.</p>}

        {questions &&
          questions.map((q, i) => (
            <article
              key={q.id}
              style={{ animationDelay: `${i * 40}ms` }}
              className="animate-fade-up opacity-0 border-b border-zinc-900 pb-10 last:border-0"
            >
              <p className="text-xs font-mono uppercase tracking-wide text-zinc-500 mb-2">{q.scheduled_date}</p>
              <h2 className="text-lg font-medium text-zinc-100 mb-4">{q.question_text}</h2>
              {q.code_snippet && <CodeBlock code={q.code_snippet} track={q.track} className="mb-4" />}
              <ol className="space-y-1 mb-4 text-sm font-mono">
                {q.options.map((opt, idx) => (
                  <li key={idx} className={idx === q.correct_index ? 'text-emerald-400' : 'text-zinc-500'}>
                    <span className="mr-2">{['A', 'B', 'C', 'D'][idx]}</span>
                    {opt}
                    {idx === q.correct_index ? ' ✓' : ''}
                  </li>
                ))}
              </ol>
              <p className="text-sm text-zinc-400 leading-relaxed bg-zinc-900/60 border border-zinc-800 rounded-lg p-4">
                {q.explanation}
              </p>
            </article>
          ))}
      </main>
    </div>
  );
}
