import React from 'react';

export default function ProgressBar({ progress }) {
  const pct = Math.min(100, Math.round((progress.answered / progress.total) * 100));

  return (
    <div className="fixed top-0 left-0 right-0 h-1 bg-zinc-900 z-20">
      <div
        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-[width] duration-700 ease-out"
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={progress.answered}
        aria-valuemin={0}
        aria-valuemax={progress.total}
        aria-label="Weekly challenge streak"
      />
    </div>
  );
}
