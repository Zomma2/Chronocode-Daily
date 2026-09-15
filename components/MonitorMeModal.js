import React, { useEffect, useState } from 'react';
import AccuracyGauge from './AccuracyGauge';
import ActivityCalendar from './ActivityCalendar';
import DifficultyBadge from './DifficultyBadge';

export default function MonitorMeModal({
  isOpen,
  onClose,
  analytics,
  user,
}) {
  const [selectedTrack, setSelectedTrack] = useState('all'); // 'all' | 'python' | 'node'

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !analytics) return null;

  const {
    totalAttempts = 0,
    correctCount = 0,
    incorrectCount = 0,
    overallAccuracyRate = 0,
    currentStreak = 0,
    longestStreak = 0,
    averageTimeSeconds = 0,
    trackBreakdown = {},
    topicMastery = [],
    difficultyBreakdown = {},
    speedAccuracy = {},
    activityCalendar = [],
    activeDaysCount = 0,
  } = analytics;

  // Filter calculations based on selected track tab
  const pythonStats = trackBreakdown.python || { total: 0, correct: 0, accuracy: 0, avgTimeSeconds: 0 };
  const nodeStats = trackBreakdown.node || { total: 0, correct: 0, accuracy: 0, avgTimeSeconds: 0 };

  const currentTrackTotal = selectedTrack === 'python'
    ? pythonStats.total
    : selectedTrack === 'node'
    ? nodeStats.total
    : totalAttempts;

  const currentTrackCorrect = selectedTrack === 'python'
    ? pythonStats.correct
    : selectedTrack === 'node'
    ? nodeStats.correct
    : correctCount;

  const currentTrackIncorrect = currentTrackTotal - currentTrackCorrect;

  const currentTrackAccuracy = selectedTrack === 'python'
    ? pythonStats.accuracy
    : selectedTrack === 'node'
    ? nodeStats.accuracy
    : overallAccuracyRate;

  const currentTrackAvgTime = selectedTrack === 'python'
    ? pythonStats.avgTimeSeconds
    : selectedTrack === 'node'
    ? nodeStats.avgTimeSeconds
    : averageTimeSeconds;

  const getAccuracyColor = (rate) => {
    if (rate >= 80) return 'text-emerald-400';
    if (rate >= 60) return 'text-amber-400';
    if (rate > 0) return 'text-rose-400';
    return 'text-zinc-500';
  };

  const getMasteryBadge = (level) => {
    switch (level) {
      case 'Mastered':
        return 'bg-emerald-950/60 border-emerald-800/80 text-emerald-400';
      case 'Proficient':
        return 'bg-sky-950/60 border-sky-800/80 text-sky-400';
      case 'Learning':
        return 'bg-amber-950/60 border-amber-800/80 text-amber-300';
      case 'Needs Review':
        return 'bg-rose-950/60 border-rose-800/80 text-rose-400';
      default:
        return 'bg-zinc-900 border-zinc-800 text-zinc-500';
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="monitor-me-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 overflow-y-auto bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-zinc-950 border border-zinc-800/90 rounded-2xl shadow-2xl p-5 sm:p-7 space-y-7 custom-scrollbar">
        {/* Modal Header */}
        <div className="flex items-start justify-between border-b border-zinc-800/80 pb-5">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <span className="flex h-2.5 w-2.5 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <h2 id="monitor-me-title" className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                <span>Monitor Me</span>
                <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-400">
                  Analytics & Mastery
                </span>
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400">
              Personalized speed, accuracy, track proficiency, and topic retention analytics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Track Filter Tabs */}
            <div className="flex bg-zinc-900/90 p-1 rounded-lg border border-zinc-800 text-xs font-medium">
              <button
                onClick={() => setSelectedTrack('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedTrack === 'all'
                    ? 'bg-zinc-700 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setSelectedTrack('python')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedTrack === 'python'
                    ? 'bg-zinc-700 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Python
              </button>
              <button
                onClick={() => setSelectedTrack('node')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedTrack === 'node'
                    ? 'bg-zinc-700 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                Node.js
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg border border-zinc-800 bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              aria-label="Close analytics modal"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* 1. High-Level KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Card 1: Total Attempted */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Attempted</span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight">
              {currentTrackTotal}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {currentTrackCorrect} correct / {currentTrackIncorrect} incorrect
            </div>
          </div>

          {/* Card 2: Overall Accuracy */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Accuracy Rate</span>
            </div>
            <div className={`font-mono text-2xl sm:text-3xl font-bold tracking-tight ${getAccuracyColor(currentTrackAccuracy)}`}>
              {currentTrackTotal > 0 ? `${currentTrackAccuracy}%` : '—'}
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {currentTrackAccuracy >= 80 ? 'Exceptional mastery' : currentTrackAccuracy >= 60 ? 'Solid performance' : 'Keep practicing'}
            </div>
          </div>

          {/* Card 3: Daily Streak & Longest Streak */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Daily Streak</span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-amber-400 tracking-tight flex items-baseline gap-2">
              <span>{currentStreak}</span>
              <span className="text-xs font-normal text-zinc-500 font-sans">days</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              Longest: <span className="text-zinc-300 font-mono font-semibold">{longestStreak} days</span>
            </div>
          </div>

          {/* Card 4: Average Time per Question */}
          <div className="p-4 rounded-xl bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Avg Response Time</span>
            </div>
            <div className="font-mono text-2xl sm:text-3xl font-bold text-white tracking-tight flex items-baseline gap-1.5">
              <span>{currentTrackAvgTime > 0 ? `${currentTrackAvgTime}s` : '—'}</span>
            </div>
            <div className="text-[11px] text-zinc-500 mt-1">
              {currentTrackAvgTime > 0 && currentTrackAvgTime < 6 ? 'Rapid execution' : 'Careful problem solving'}
            </div>
          </div>
        </div>

        {/* 2. Visualizers Row: Accuracy Visualizer + Speed vs Accuracy */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Accuracy Visualizer (SVG Circular Donut Gauge) */}
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  Accuracy Visualizer
                </h3>
                <p className="text-xs text-zinc-500">Correct vs. Incorrect ratio</p>
              </div>
              <span className="text-xs font-mono text-zinc-400">
                {selectedTrack.toUpperCase()}
              </span>
            </div>

            <div className="pt-2 flex items-center justify-center">
              <AccuracyGauge
                correct={currentTrackCorrect}
                incorrect={currentTrackIncorrect}
                size={140}
                strokeWidth={12}
              />
            </div>
          </div>

          {/* Speed vs Accuracy Card */}
          <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-zinc-200">
                  Speed vs. Accuracy Insights
                </h3>
                <p className="text-xs text-zinc-500">How pacing impacts your precision</p>
              </div>
            </div>

            <div className="space-y-3 pt-1">
              {/* Fast (< 5s) */}
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-zinc-300">
                    Fast Pace (&lt; 5s)
                  </span>
                  <span className="font-mono text-zinc-400">
                    {speedAccuracy.fast?.total || 0} attempts (
                    <strong className={getAccuracyColor(speedAccuracy.fast?.accuracy || 0)}>
                      {speedAccuracy.fast?.accuracy || 0}%
                    </strong>
                    )
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400 transition-all duration-500"
                    style={{ width: `${speedAccuracy.fast?.accuracy || 0}%` }}
                  />
                </div>
              </div>

              {/* Moderate (5s - 15s) */}
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-zinc-300">
                    Steady Pace (5s - 15s)
                  </span>
                  <span className="font-mono text-zinc-400">
                    {speedAccuracy.medium?.total || 0} attempts (
                    <strong className={getAccuracyColor(speedAccuracy.medium?.accuracy || 0)}>
                      {speedAccuracy.medium?.accuracy || 0}%
                    </strong>
                    )
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${speedAccuracy.medium?.accuracy || 0}%` }}
                  />
                </div>
              </div>

              {/* Deliberate (> 15s) */}
              <div className="p-2.5 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-medium text-zinc-300">
                    Deep Dive (&gt; 15s)
                  </span>
                  <span className="font-mono text-zinc-400">
                    {speedAccuracy.deliberate?.total || 0} attempts (
                    <strong className={getAccuracyColor(speedAccuracy.deliberate?.accuracy || 0)}>
                      {speedAccuracy.deliberate?.accuracy || 0}%
                    </strong>
                    )
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-400 transition-all duration-500"
                    style={{ width: `${speedAccuracy.deliberate?.accuracy || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Track Breakdown (Python vs. Node.js) */}
        <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">
                Track Breakdown (Python vs. Node.js)
              </h3>
              <p className="text-xs text-zinc-500">Comparative accuracy and question volume per technology</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Python Track Bar */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-950/70 border border-sky-800/60 text-sky-400">PY</span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Python</h4>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {pythonStats.total} attempts • {pythonStats.avgTimeSeconds > 0 ? `${pythonStats.avgTimeSeconds}s avg` : 'No timed attempts'}
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className={`text-lg font-bold ${getAccuracyColor(pythonStats.accuracy)}`}>
                    {pythonStats.total > 0 ? `${pythonStats.accuracy}%` : '—'}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {pythonStats.correct}/{pythonStats.total} correct
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400 transition-all duration-500"
                  style={{ width: `${pythonStats.accuracy}%` }}
                />
              </div>
            </div>

            {/* Node.js Track Bar */}
            <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">NODE</span>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Node.js</h4>
                    <p className="text-[11px] text-zinc-500 font-mono">
                      {nodeStats.total} attempts • {nodeStats.avgTimeSeconds > 0 ? `${nodeStats.avgTimeSeconds}s avg` : 'No timed attempts'}
                    </p>
                  </div>
                </div>
                <div className="text-right font-mono">
                  <div className={`text-lg font-bold ${getAccuracyColor(nodeStats.accuracy)}`}>
                    {nodeStats.total > 0 ? `${nodeStats.accuracy}%` : '—'}
                  </div>
                  <div className="text-[10px] text-zinc-500">
                    {nodeStats.correct}/{nodeStats.total} correct
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-emerald-600 to-lime-400 transition-all duration-500"
                  style={{ width: `${nodeStats.accuracy}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* 4. Category/Topic Mastery */}
        <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-zinc-200">
                Category & Topic Mastery
              </h3>
              <p className="text-xs text-zinc-500">
                Detailed retention and accuracy mapped to core language domains
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topicMastery.map((tm) => (
              <div
                key={tm.topic}
                className="p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800/80 hover:border-zinc-700/80 transition-colors space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-xs font-semibold text-zinc-200 truncate">
                      {tm.topic}
                    </span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${getMasteryBadge(tm.masteryLevel)}`}>
                      {tm.masteryLevel}
                    </span>
                  </div>

                  <div className="text-right font-mono text-xs whitespace-nowrap">
                    <span className={`font-bold ${getAccuracyColor(tm.accuracy)}`}>
                      {tm.total > 0 ? `${tm.accuracy}%` : '0%'}
                    </span>
                    <span className="text-zinc-500 text-[10px] ml-1">
                      ({tm.correct}/{tm.total})
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      tm.accuracy >= 80
                        ? 'bg-emerald-400'
                        : tm.accuracy >= 60
                        ? 'bg-sky-400'
                        : tm.accuracy > 0
                        ? 'bg-amber-400'
                        : 'bg-zinc-700'
                    }`}
                    style={{ width: `${Math.max(4, tm.accuracy)}%` }}
                  />
                </div>

                <div className="flex items-center justify-between text-[10px] text-zinc-500 font-mono">
                  <span>{tm.total} challenge{tm.total === 1 ? '' : 's'} recorded</span>
                  {tm.avgTimeSeconds > 0 && (
                    <span>⏱ {tm.avgTimeSeconds}s avg</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Activity Calendar (60 Days GitHub-Style Grid) */}
        <ActivityCalendar
          calendar={activityCalendar}
          activeDaysCount={activeDaysCount}
        />

        {/* Footer info */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-900 text-xs text-zinc-500">
          <span>
            {user ? `Signed in as ${user.username}` : 'Guest session (stats saved locally)'}
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-colors border border-zinc-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
