import React from 'react';

export default function DifficultyBadge({ difficulty = 'Medium', className = '' }) {
  const norm = (difficulty || 'Medium').toLowerCase();

  let style = 'bg-amber-950/40 border-amber-800/60 text-amber-300';
  let dotColor = 'bg-amber-400';
  let label = 'Medium';

  if (norm === 'easy') {
    style = 'bg-emerald-950/40 border-emerald-800/60 text-emerald-400';
    dotColor = 'bg-emerald-400';
    label = 'Easy';
  } else if (norm === 'hard') {
    style = 'bg-rose-950/40 border-rose-800/60 text-rose-400';
    dotColor = 'bg-rose-400';
    label = 'Hard';
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-mono font-medium border ${style} ${className}`}
      title={`Difficulty: ${label}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${dotColor} opacity-80`} />
      <span>{label}</span>
    </span>
  );
}
