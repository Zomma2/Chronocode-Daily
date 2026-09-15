import React from 'react';

export default function MonitorMeWidget({
  analytics,
  onOpenModal,
  className = '',
}) {
  const {
    totalAttempts = 0,
    overallAccuracyRate = 0,
    currentStreak = 0,
    longestStreak = 0,
    averageTimeSeconds = 0,
    trackBreakdown = {},
  } = analytics || {};

  const pythonStats = trackBreakdown.python || { total: 0, accuracy: 0 };
  const nodeStats = trackBreakdown.node || { total: 0, accuracy: 0 };

  const getAccuracyColor = (rate) => {
    if (rate >= 80) return 'text-emerald-400';
    if (rate >= 60) return 'text-amber-400';
    if (rate > 0) return 'text-rose-400';
    return 'text-zinc-500';
  };

  return (
    <div
      className={`w-full rounded-xl bg-zinc-900/60 border border-zinc-800/90 p-4 space-y-4 shadow-xl hover:border-zinc-700/80 transition-all ${className}`}
    >
      {/* Widget Header */}
      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <h3 className="text-sm font-bold text-zinc-100 tracking-tight flex items-center gap-1.5">
            <span>Monitor Me</span>
          </h3>
        </div>

        <button
          onClick={onOpenModal}
          className="text-[11px] font-medium text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-1"
          title="Open expanded analytics"
        >
          <span>Expand</span>
          <span>↗</span>
        </button>
      </div>

      {/* 2x2 Mini KPI Grid */}
      <div className="grid grid-cols-2 gap-2 text-left">
        {/* Accuracy */}
        <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/70">
          <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
            Accuracy
          </div>
          <div className={`font-mono text-lg font-bold tracking-tight mt-0.5 ${getAccuracyColor(overallAccuracyRate)}`}>
            {totalAttempts > 0 ? `${overallAccuracyRate}%` : '—'}
          </div>
        </div>

        {/* Streak */}
        <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/70">
          <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
            Streak
          </div>
          <div className="font-mono text-lg font-bold text-amber-400 tracking-tight mt-0.5">
            {currentStreak}<span className="text-xs text-zinc-500 font-sans ml-0.5">d</span>
          </div>
        </div>

        {/* Attempted */}
        <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/70">
          <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
            Attempted
          </div>
          <div className="font-mono text-lg font-bold text-white tracking-tight mt-0.5">
            {totalAttempts}
          </div>
        </div>

        {/* Avg Time */}
        <div className="p-2.5 rounded-lg bg-zinc-950/80 border border-zinc-800/70">
          <div className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">
            Avg Speed
          </div>
          <div className="font-mono text-lg font-bold text-zinc-200 tracking-tight mt-0.5">
            {averageTimeSeconds > 0 ? `${averageTimeSeconds}s` : '—'}
          </div>
        </div>
      </div>

      {/* Mini Track Comparison */}
      <div className="space-y-2 pt-1 border-t border-zinc-800/60">
        <div className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider">
          Track Performance
        </div>

        {/* Python */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-semibold px-1 py-0.2 rounded bg-sky-950/80 border border-sky-800/60 text-sky-400">PY</span>
              <span>Python</span>
            </span>
            <span className={getAccuracyColor(pythonStats.accuracy)}>
              {pythonStats.total > 0 ? `${pythonStats.accuracy}%` : '—'}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-sky-400 transition-all duration-300"
              style={{ width: `${pythonStats.accuracy || 0}%` }}
            />
          </div>
        </div>

        {/* Node.js */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs font-mono">
            <span className="text-zinc-300 flex items-center gap-1.5">
              <span className="text-[10px] font-mono font-semibold px-1 py-0.2 rounded bg-emerald-950/80 border border-emerald-800/60 text-emerald-400">JS</span>
              <span>Node.js</span>
            </span>
            <span className={getAccuracyColor(nodeStats.accuracy)}>
              {nodeStats.total > 0 ? `${nodeStats.accuracy}%` : '—'}
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${nodeStats.accuracy || 0}%` }}
            />
          </div>
        </div>
      </div>

      {/* CTA Button to open expanded view */}
      <button
        type="button"
        onClick={onOpenModal}
        className="w-full py-2 px-3 text-xs font-medium rounded-lg border border-emerald-900/50 bg-emerald-950/30 hover:bg-emerald-900/40 text-emerald-400 hover:text-emerald-300 transition-colors flex items-center justify-center gap-1.5 group"
      >
        <span>View Full Analytics</span>
        <span className="group-hover:translate-x-0.5 transition-transform">→</span>
      </button>
    </div>
  );
}
