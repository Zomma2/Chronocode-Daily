import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AccuracyGauge from '../components/AccuracyGauge';
import ActivityCalendar from '../components/ActivityCalendar';
import { calculateAnalytics, getGuestAttempts } from '../lib/analytics';

export default function MonitorMePage() {
  const [analytics, setAnalytics] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedTrack, setSelectedTrack] = useState('all');

  useEffect(() => {
    async function loadData() {
      try {
        const [meRes, analyticsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/monitor-me'),
        ]);

        if (meRes.ok) {
          const meData = await meRes.json();
          setUser(meData.user);
        }

        if (analyticsRes.ok) {
          const aData = await analyticsRes.json();
          if (aData.authenticated && aData.analytics) {
            setAnalytics(aData.analytics);
            setLoading(false);
            return;
          }
        }
      } catch (e) {
        // ignore
      }

      // Guest fallback
      const guestAttempts = getGuestAttempts();
      setAnalytics(calculateAnalytics(guestAttempts, []));
      setLoading(false);
    }

    loadData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-300 flex items-center justify-center">
        <div className="flex items-center gap-3 text-sm font-mono text-zinc-400">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Loading Monitor Me analytics...</span>
        </div>
      </div>
    );
  }

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
    speedAccuracy = {},
    activityCalendar = [],
    activeDaysCount = 0,
  } = analytics || {};

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
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-900/50">
      {/* Top Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
            >
              ← Back to Daily Quiz
            </Link>
            <span className="text-zinc-700">|</span>
            <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
              <span>Monitor Me</span>
              <span className="text-xs font-mono font-normal px-2 py-0.5 rounded-full bg-zinc-900 border border-zinc-800 text-emerald-400">
                Live Analytics
              </span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Track Filter */}
            <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800 text-xs font-medium">
              <button
                onClick={() => setSelectedTrack('all')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  selectedTrack === 'all'
                    ? 'bg-zinc-700 text-white font-semibold'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                All Tracks
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Total Attempted</span>
            </div>
            <div className="font-mono text-3xl font-bold text-white tracking-tight">
              {currentTrackTotal}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              {currentTrackCorrect} correct • {currentTrackIncorrect} incorrect
            </div>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Overall Accuracy</span>
            </div>
            <div className={`font-mono text-3xl font-bold tracking-tight ${getAccuracyColor(currentTrackAccuracy)}`}>
              {currentTrackTotal > 0 ? `${currentTrackAccuracy}%` : '—'}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Across all recorded questions
            </div>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Current Streak</span>
            </div>
            <div className="font-mono text-3xl font-bold text-amber-400 tracking-tight">
              {currentStreak} <span className="text-sm font-sans font-normal text-zinc-500">days</span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Longest: <strong className="text-zinc-300 font-mono">{longestStreak} days</strong>
            </div>
          </div>

          <div className="p-5 rounded-xl bg-zinc-900/50 border border-zinc-800/80">
            <div className="flex items-center justify-between text-zinc-500 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Avg Response Time</span>
            </div>
            <div className="font-mono text-3xl font-bold text-white tracking-tight">
              {currentTrackAvgTime > 0 ? `${currentTrackAvgTime}s` : '—'}
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Per question submission
            </div>
          </div>
        </div>

        {/* Visualizers */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">
              Accuracy Breakdown
            </h3>
            <div className="flex justify-center pt-2">
              <AccuracyGauge
                correct={currentTrackCorrect}
                incorrect={currentTrackIncorrect}
                size={150}
                strokeWidth={12}
              />
            </div>
          </div>

          <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
            <h3 className="text-sm font-semibold text-zinc-200">
              Pacing vs. Precision
            </h3>

            <div className="space-y-3 pt-2">
              <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/70">
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-zinc-300">Fast (&lt; 5s)</span>
                  <span className={getAccuracyColor(speedAccuracy.fast?.accuracy || 0)}>
                    {speedAccuracy.fast?.accuracy || 0}% ({speedAccuracy.fast?.correct || 0}/{speedAccuracy.fast?.total || 0})
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${speedAccuracy.fast?.accuracy || 0}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/70">
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-zinc-300">Steady (5s - 15s)</span>
                  <span className={getAccuracyColor(speedAccuracy.medium?.accuracy || 0)}>
                    {speedAccuracy.medium?.accuracy || 0}% ({speedAccuracy.medium?.correct || 0}/{speedAccuracy.medium?.total || 0})
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${speedAccuracy.medium?.accuracy || 0}%` }}
                  />
                </div>
              </div>

              <div className="p-3 rounded-lg bg-zinc-950/70 border border-zinc-800/70">
                <div className="flex items-center justify-between text-xs mb-1.5 font-mono">
                  <span className="text-zinc-300">Deliberate (&gt; 15s)</span>
                  <span className={getAccuracyColor(speedAccuracy.deliberate?.accuracy || 0)}>
                    {speedAccuracy.deliberate?.accuracy || 0}% ({speedAccuracy.deliberate?.correct || 0}/{speedAccuracy.deliberate?.total || 0})
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-sky-400"
                    style={{ width: `${speedAccuracy.deliberate?.accuracy || 0}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Track Breakdown (Python vs Node.js) */}
        <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">
            Track Comparison: Python vs. Node.js
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-sky-950/70 border border-sky-800/60 text-sky-400">PY</span>
                  <span className="font-semibold text-white">Python</span>
                </div>
                <div className="font-mono text-sm font-bold text-sky-400">
                  {pythonStats.accuracy}% ({pythonStats.correct}/{pythonStats.total})
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-sky-400"
                  style={{ width: `${pythonStats.accuracy}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-400">NODE</span>
                  <span className="font-semibold text-white">Node.js</span>
                </div>
                <div className="font-mono text-sm font-bold text-emerald-400">
                  {nodeStats.accuracy}% ({nodeStats.correct}/{nodeStats.total})
                </div>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-emerald-400"
                  style={{ width: `${nodeStats.accuracy}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Topic Mastery */}
        <div className="p-6 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-4">
          <h3 className="text-sm font-semibold text-zinc-200">
            Domain & Topic Mastery
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topicMastery.map((tm) => (
              <div
                key={tm.topic}
                className="p-4 rounded-xl bg-zinc-950/70 border border-zinc-800/80 space-y-2"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-zinc-200">{tm.topic}</span>
                    <span className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border ${getMasteryBadge(tm.masteryLevel)}`}>
                      {tm.masteryLevel}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-300">
                    {tm.accuracy}% ({tm.correct}/{tm.total})
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-400"
                    style={{ width: `${Math.max(4, tm.accuracy)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Calendar */}
        <ActivityCalendar
          calendar={activityCalendar}
          activeDaysCount={activeDaysCount}
        />
      </main>
    </div>
  );
}
