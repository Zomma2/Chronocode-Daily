import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import TipsFeed from './TipsFeed';
import QuestionStatsWidget from './QuestionStatsWidget';
import CodeBlock from './CodeBlock';
import InteractiveRuntime from './InteractiveRuntime';

import StreakDisplay from './StreakDisplay';
import Celebration from './Celebration';
import Avatar from './Avatar';
import { getWeeklyProgress, recordAnsweredToday } from '../lib/streak';
import { playTone, triggerHaptic } from '../lib/feedback';
import { buildMarkdown, copyToClipboard } from '../lib/exportMarkdown';
import { downloadCodeSnippetPng, downloadFullQuestionPng, EXPORT_STYLES } from '../lib/exportPng';
import DifficultyBadge from './DifficultyBadge';
import QuestionTimer from './QuestionTimer';
import ExplainFurtherButton from './ExplainFurtherButton';
import ExportShareSection from './ExportShareSection';
import MonitorMeWidget from './MonitorMeWidget';
import MonitorMeModal from './MonitorMeModal';
import { calculateAnalytics, getGuestAttempts, saveGuestAttempt } from '../lib/analytics';

function todayUTC() {
  return new Date().toISOString().slice(0, 10);
}

function msUntilNextUTCMidnight() {
  const now = new Date();
  const nextMidnight = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  return nextMidnight.getTime() - now.getTime();
}

function formatCountdown(ms) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

function ChallengeSkeleton() {
  return (
    <div className="w-full flex flex-col items-center justify-center py-20 animate-fade-in min-h-[50vh]">
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer glowing rings */}
        <div className="absolute inset-0 rounded-full border border-indigo-500/20 scale-150 animate-[ping_3s_ease-in-out_infinite]" />
        <div className="absolute inset-0 rounded-full border border-emerald-500/20 scale-110 animate-[ping_2s_ease-in-out_infinite_0.5s]" />
        
        {/* Core icon */}
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-zinc-900/80 border border-zinc-700/80 shadow-[0_0_30px_-5px_rgba(16,185,129,0.25)] backdrop-blur-xl">
          <svg className="w-10 h-10 text-emerald-400 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="16 18 22 12 16 6" />
            <polyline points="8 6 2 12 8 18" />
          </svg>
          <div className="absolute inset-0 rounded-2xl border border-emerald-500/30 animate-pulse" />
        </div>
      </div>
      
      <h3 className="text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 tracking-tight mb-3">
        Compiling Challenge
      </h3>
      <p className="text-zinc-400 text-sm max-w-sm text-center mb-10">
        Fetching your personalized daily code snippets and warming up the editor...
      </p>

      {/* Modern thin progress bar */}
      <div className="w-64 max-w-full">
        <div className="h-1.5 w-full bg-zinc-800/80 rounded-full overflow-hidden border border-zinc-700/50">
          <div className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full animate-[shimmer_1.5s_infinite_linear]" style={{ width: '100%', backgroundSize: '200% 100%' }} />
        </div>
      </div>
    </div>
  );
}

export default function CodeBitsDaily() {
  const router = useRouter();
  const [track, setTrack] = useState('python');
  const [questions, setQuestions] = useState(null);
  const [communityQuestions, setCommunityQuestions] = useState([]);
  const [communityUnlocked, setCommunityUnlocked] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answeredQuestions, setAnsweredQuestions] = useState({});
  const [tip, setTip] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(() => formatCountdown(msUntilNextUTCMidnight()));
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState({ answered: 0, total: 7 });
  const [copyState, setCopyState] = useState('idle');
  
  // User and streak state
  const [user, setUser] = useState(null);
  const [userStats, setUserStats] = useState(null);
  const [streakData, setStreakData] = useState(null);
  const [showCelebration, setShowCelebration] = useState(false);
  const [avatarVisible, setAvatarVisible] = useState(true);
  const [userLoaded, setUserLoaded] = useState(false);
  const [globalStats, setGlobalStats] = useState(null);
  const [showRuntime, setShowRuntime] = useState(false);

  // Monitor Me Analytics State
  const [analytics, setAnalytics] = useState(null);
  const [isMonitorMeOpen, setIsMonitorMeOpen] = useState(false);
  const questionStartTimeRef = useRef(Date.now());

  const pythonTabRef = useRef(null);
  const nodeTabRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});
  const loadRequestId = useRef(0);

  const date = useMemo(() => todayUTC(), []);
  const activeQuestions = communityUnlocked ? [...questions, ...communityQuestions] : questions;
  const currentQuestion = activeQuestions ? activeQuestions[currentQuestionIndex] : null;
  const currentQuestionAnswer = currentQuestion ? answeredQuestions[currentQuestion.id] : null;
  const allOfficialAnswered = questions && questions.every(q => answeredQuestions[q.id]);
  const allAnswered = communityUnlocked ? activeQuestions && activeQuestions.every(q => answeredQuestions[q.id]) : allOfficialAnswered;

  // Load analytics (server if logged in, local storage for guests)
  const fetchAnalytics = useCallback(async () => {
    try {
      const res = await fetch('/api/monitor-me');
      if (res.ok) {
        const data = await res.json();
        if (data.authenticated && data.analytics) {
          setAnalytics(data.analytics);
          return;
        }
      }
    } catch (err) {
      // ignore
    }

    const guestAttempts = getGuestAttempts();
    setAnalytics(calculateAnalytics(guestAttempts, []));
  }, []);

  // Reset question timer start when index or question changes
  useEffect(() => {
    questionStartTimeRef.current = Date.now();
    setShowRuntime(false);
  }, [currentQuestionIndex, currentQuestion?.id]);

  // Check user session on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch('/api/stats');
        if (res.ok) {
          const data = await res.json();
          setGlobalStats(data.counts);
        }
      } catch (err) {}
    };
    fetchStats();

    const checkSession = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setUserStats(data.stats);
        }
      } catch (err) {
        console.log('Not authenticated');
      } finally {
        setUserLoaded(true);
      }
    };

    checkSession();
  }, []);

  // Initialize streakData from userStats on load
  useEffect(() => {
    if (!userStats?.languageStreaks) return;
    const streak = userStats.languageStreaks.find((s) => s.language === track);
    if (streak) {
      setStreakData({
        questionsAnsweredToday: streak.questions_answered_today || 0,
        currentStreak: streak.current_streak || 0,
        bestStreak: streak.best_streak || 0,
        streakIncremented: false,
      });
    }
  }, [userStats, track]);

  useEffect(() => {
    if (!userLoaded) return;
    fetchAnalytics();
  }, [fetchAnalytics, userLoaded, user?.id]);

  useEffect(() => {
    setProgress(getWeeklyProgress());
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(formatCountdown(msUntilNextUTCMidnight()));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const activeRef = track === 'python' ? pythonTabRef : nodeTabRef;
    if (activeRef.current) {
      setIndicatorStyle({
        left: activeRef.current.offsetLeft,
        width: activeRef.current.offsetWidth,
      });
    }
  }, [track]);

  const load = useCallback(async () => {
    // Tag this call so a slower, now-stale request can't clobber a newer track's state
    const requestId = ++loadRequestId.current;
    const requestedTrack = track;
    const requestedUserId = user?.id || null;
    setLoading(true);
    setError(null);
    setCurrentQuestionIndex(0);
    setAnsweredQuestions({});
    setSelectedIndex(null);
    setQuestions(null);
    setTip(null);

    try {
      const [challengeRes, tipRes, answersRes] = await Promise.all([
        fetch(`/api/daily-challenge?track=${requestedTrack}`),
        fetch(`/api/daily-tip?track=${requestedTrack}`),
        // Server-side source of truth for this user's answers - not localStorage,
        // so progress is genuinely bound to the signed-in account.
        requestedUserId ? fetch(`/api/my-answers?track=${requestedTrack}`) : Promise.resolve(null),
      ]);

      if (!challengeRes.ok) throw new Error('No challenge available for today');
      const challengeData = await challengeRes.json();
      const tipData = tipRes.ok ? await tipRes.json() : null;
      const answersData = answersRes && answersRes.ok ? await answersRes.json() : null;

      if (requestId !== loadRequestId.current) return; // a newer load() superseded this one

      setQuestions(challengeData.questions);
      setTip(tipData);
      setAnsweredQuestions(answersData?.answers || {});
    } catch (err) {
      if (requestId !== loadRequestId.current) return;
      setError(err.message);
    } finally {
      if (requestId === loadRequestId.current) setLoading(false);
    }
  }, [track, user?.id]);

  // Wait until we know whether a user is signed in before loading, so we fetch
  // the right (user-bound) answers on the very first request instead of a guest
  // fetch followed by a second user-bound refetch.
  useEffect(() => {
    if (!userLoaded) return;
    load().catch(() => {});
  }, [load, userLoaded]);

  const handleSelect = async (index) => {
    if (currentQuestionAnswer || !currentQuestion || verifying) return;
    const elapsedMs = Math.max(150, Date.now() - questionStartTimeRef.current);
    setSelectedIndex(index);
    setVerifying(true);

    try {
      const res = await fetch('/api/verify-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question_id: currentQuestion.id, 
          selected_index: index,
          language: track,
          response_time_ms: elapsedMs,
        }),
      });
      if (!res.ok) throw new Error('Could not verify answer');
      const data = await res.json();

      const answerData = {
        ...data,
        response_time_ms: elapsedMs,
      };

      setAnsweredQuestions(prev => ({
        ...prev,
        [currentQuestion.id]: answerData,
      }));

      // Update streak data if available
      if (data.streak) {
        setStreakData(data.streak);
      }
      if (data.correct) {
        setShowCelebration(true);
      }

      // Update Monitor Me metrics dynamically
      if (!user) {
        saveGuestAttempt({
          question_id: currentQuestion.id,
          track,
          chosen_answer: index,
          is_correct: data.correct,
          response_time_ms: elapsedMs,
          difficulty: currentQuestion.difficulty || 'Medium',
          topic: currentQuestion.topic || 'General',
        });
        const guestAttempts = getGuestAttempts();
        setAnalytics(calculateAnalytics(guestAttempts, []));
      } else {
        fetchAnalytics().catch(() => {});
      }
      
      // Answer is already persisted server-side (per user) by /api/verify-answer
      recordAnsweredToday(date);
      setProgress(getWeeklyProgress());
      playTone(data.correct);
      triggerHaptic(data.correct ? 15 : [10, 30, 10]);
    } catch (err) {
      setError(err.message);
      setSelectedIndex(null);
    } finally {
      setVerifying(false);
    }
  };

  const handleCopyMarkdown = async () => {
    if (!currentQuestion) return;
    const markdown = buildMarkdown({ question: currentQuestion, track, result: currentQuestionAnswer });
    const copied = await copyToClipboard(markdown);
    if (copied) {
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  const handleDownloadPng = (style) => {
    if (!currentQuestion || !currentQuestion.code_snippet) return;
    downloadCodeSnippetPng({ 
      code: currentQuestion.code_snippet, 
      track, 
      date,
      style,
    });
  };

  const handleDownloadFullQuestion = (style) => {
    if (!currentQuestion || !currentQuestionAnswer) return;
    downloadFullQuestionPng({
      question: currentQuestion.question_text,
      options: currentQuestion.options,
      correctIndex: currentQuestionAnswer.correct_index,
      explanation: currentQuestionAnswer.explanation,
      track,
      date,
      style,
    });
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedIndex(null);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < activeQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedIndex(null);
    }
  };

  const handleReset = async () => {
    if (user?.id) {
      try {
        await fetch('/api/reset-answers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ track }),
        });
      } catch (err) {
        // Ignore - load() below will still refetch current server state
      }
    }

    // Reset all state
    setAnsweredQuestions({});
    setCurrentQuestionIndex(0);
    setSelectedIndex(null);
    setShowCelebration(false);
    
    // Reload questions
    load().catch(() => {});
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-900/50 flex flex-col">
      <Celebration 
        trigger={showCelebration} 
        streakIncremented={streakData?.streakIncremented}
        questionsAnswered={streakData?.questionsAnsweredToday}
        onComplete={() => setShowCelebration(false)}
      />
      

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent flex items-center gap-3">
            <img src="/logo.png" alt="Chronocode" className="h-7 w-auto object-contain" />
            Chronocode Daily
          </h1>

          <div className="flex items-center gap-4">
            <Link
              href="/blog"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
            >
              Blog
            </Link>
            <Link
              href="/history"
              className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200"
            >
              Archive
            </Link>
            <button
              onClick={() => setIsMonitorMeOpen(true)}
              className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors duration-200 flex items-center gap-1.5 font-medium"
              title="Open Monitor Me analytics"
            >
              <span>Monitor Me</span>
              {analytics?.overallAccuracyRate > 0 && (
                <span className="hidden sm:inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/60 border border-emerald-800/60 text-emerald-400">
                  {analytics.overallAccuracyRate}%
                </span>
              )}
            </button>

            {/* Track Toggle */}
            <div className="relative flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
              <div
                className="absolute top-1 bottom-1 rounded-md bg-zinc-700 transition-all duration-300 ease-out"
                style={indicatorStyle}
              />
              <button
                ref={pythonTabRef}
                onClick={() => setTrack('python')}
                className={`relative z-[1] px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                  track === 'python' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                } hover:text-white`}
              >
                Python
              </button>
              <button
                ref={nodeTabRef}
                onClick={() => setTrack('node')}
                className={`relative z-[1] px-4 py-1.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                  track === 'node' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'
                } hover:text-white`}
              >
                Node.js
              </button>
            </div>

            {/* User Menu */}
            {user ? (
              <div className="flex items-center gap-3 ml-4 pl-4 border-l border-zinc-800">
                <span className="text-sm text-zinc-400">{user.username}</span>
                <button
                  onClick={async () => {
                    await fetch('/api/auth/logout', { method: 'POST' });
                    setUser(null);
                    router.push('/login');
                  }}
                  className="text-sm px-3 py-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 transition-colors"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-4 pl-4 border-l border-zinc-800">
                <Link href="/login" className="text-sm px-3 py-1.5 rounded-md hover:bg-zinc-800 transition-colors">
                  Login
                </Link>
                <Link href="/signup" className="text-sm px-3 py-1.5 rounded-md bg-indigo-600 hover:bg-indigo-700 transition-colors">
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-5xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-10 items-start w-full">
        <div className="flex-1 w-full max-w-3xl mx-auto lg:mx-0">
          {loading && <ChallengeSkeleton />}

          {!loading && error && !questions && (
            <div className="text-center py-16 px-6 rounded-xl border border-rose-900/40 bg-rose-950/10 animate-fade-in">
              <p className="text-rose-400 font-medium mb-1">Something went sideways.</p>
              <p className="text-zinc-500 text-sm mb-5">{error}</p>
              <button
                onClick={load}
                className="px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-sm text-zinc-200 transition-colors duration-200"
              >
                Try again
              </button>
            </div>
          )}

          {!loading && questions && currentQuestion && (
            <>
              {/* Streak Display for logged-in users */}
              {user && (streakData || Object.keys(answeredQuestions).length > 0) && (
                <StreakDisplay
                  currentStreak={streakData?.currentStreak ?? Object.keys(answeredQuestions).length}
                  bestStreak={streakData?.bestStreak ?? Object.keys(answeredQuestions).length}
                  questionsToday={streakData?.questionsAnsweredToday ?? Object.keys(answeredQuestions).length}
                  totalQuestions={activeQuestions.length || 4}
                />
              )}

              {/* Saved Progress Indicator */}
              {user && Object.keys(answeredQuestions).length > 0 && (
                <div className="mb-6 rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-4 shadow-xl backdrop-blur-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-sm font-bold">
                        {Object.keys(answeredQuestions).length}/{activeQuestions.length}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                          <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                            Saved Progress Restored
                          </span>
                        </div>
                        <p className="text-sm text-zinc-200 mt-0.5">
                          You have answered <span className="font-semibold text-emerald-400 font-mono">{Object.keys(answeredQuestions).length}</span> of <span className="font-semibold text-white font-mono">{activeQuestions.length}</span> questions today
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2.5 self-end sm:self-center pl-12 sm:pl-0">
                      <div className="w-28 sm:w-36 bg-zinc-800/80 h-2 rounded-full overflow-hidden border border-zinc-700/50">
                        <div
                          className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(100, Math.round((Object.keys(answeredQuestions).length / (activeQuestions.length || 4)) * 100))}%`,
                          }}
                        />
                      </div>
                      <span className="text-xs font-mono font-semibold text-emerald-400 min-w-[36px] text-right">
                        {Math.min(100, Math.round((Object.keys(answeredQuestions).length / (activeQuestions.length || 4)) * 100))}%
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Question Counter, Difficulty Badge, Topic, and Timer */}
              <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <div className="text-sm text-zinc-500">
                    Question <span className="font-semibold text-zinc-300">{currentQuestionIndex + 1}</span> of <span className="font-semibold text-zinc-300">{activeQuestions.length}</span>
                  </div>

                  {/* Difficulty Pill */}
                  <DifficultyBadge difficulty={currentQuestion.difficulty || 'Medium'} />

                  {/* Topic Tag */}
                  {currentQuestion.topic && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-mono text-zinc-400 bg-zinc-900 border border-zinc-800">
                      {currentQuestion.topic}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {/* Question Timer */}
                  <QuestionTimer
                    isRunning={!currentQuestionAnswer && !verifying}
                    isAnswered={Boolean(currentQuestionAnswer)}
                    finalTimeMs={currentQuestionAnswer?.response_time_ms || 0}
                  />

                  {/* Progress Dots */}
                  <div className="flex gap-1">
                    {questions.map((_, i) => (
                      <div
                        key={i}
                        className={`h-2 rounded-full transition-all ${
                          i === currentQuestionIndex
                            ? 'w-6 bg-emerald-500'
                            : answeredQuestions[questions[i].id]
                            ? 'w-2 bg-emerald-600'
                            : 'w-2 bg-zinc-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Challenge Card */}
              <div
                key={currentQuestion.id}
                className="animate-scale-in bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl mb-8 transition-shadow hover:shadow-emerald-950/20"
              >
                <div className="p-6 md:p-8">
                  <h2 className="text-lg md:text-xl font-medium text-zinc-100 mb-6">
                    {currentQuestion.question_text}
                  </h2>

                  {/* Code Block */}
                  {currentQuestion.code_snippet && (
                    <CodeBlock code={currentQuestion.code_snippet} track={track} className="mb-8" />
                  )}

                  {!showRuntime ? (
                    <button
                      onClick={() => setShowRuntime(true)}
                      className="mt-2 mb-8 px-4 py-2 rounded-lg text-sm font-medium transition-colors bg-indigo-950/30 hover:bg-indigo-900/40 text-indigo-300 border border-indigo-900/50 flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                      </svg>
                      Spin up Runtime
                    </button>
                  ) : (
                    <InteractiveRuntime track={track} initialCode={currentQuestion.code_snippet || ''} />
                  )}

                  {/* Options */}
                  <div className="space-y-3">
                    {currentQuestion.options.map((option, index) => {
                      const isSelected = selectedIndex === index;
                      const isCorrect = currentQuestionAnswer && index === currentQuestionAnswer.correct_index;
                      const isWrongPick = currentQuestionAnswer && isSelected && !isCorrect;

                      let buttonStyle = 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 text-zinc-300';

                      if (currentQuestionAnswer) {
                        if (isCorrect) {
                          buttonStyle = 'bg-emerald-950/30 border-emerald-500 text-emerald-400';
                        } else if (isWrongPick) {
                          buttonStyle = 'bg-rose-950/30 border-rose-500 text-rose-400';
                        } else {
                          buttonStyle = 'bg-zinc-950 border-zinc-800 opacity-50';
                        }
                      } else if (isSelected) {
                        buttonStyle = 'bg-zinc-800 border-zinc-500 text-white';
                      }

                      return (
                        <div key={index} className="relative group">
                          <button
                            onClick={() => handleSelect(index)}
                            disabled={currentQuestionAnswer}
                            style={{ animationDelay: `${index * 60}ms` }}
                            className={`animate-fade-up opacity-0 w-full text-left px-5 py-4 rounded-lg border transition-colors duration-300 font-mono text-sm ${buttonStyle} ${
                              !currentQuestionAnswer && 'hover:bg-zinc-900 hover:scale-[1.01] active:scale-[0.99] cursor-pointer transition-transform duration-150'
                            } ${isSelected && !currentQuestionAnswer ? 'animate-pop-in' : ''}`}
                          >
                            <span className="mr-4 text-zinc-500">{['A', 'B', 'C', 'D'][index]}</span>
                            {option}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              
                  {/* Community Voting */}
                  {currentQuestion.is_community && (
                    <div className="mt-4 pt-4 border-t border-zinc-800/80 flex items-center gap-3">
                       <button onClick={() => fetch('/api/admin/vote', { method: 'POST', body: JSON.stringify({ questionId: currentQuestion.id, voteType: 1 }), headers: {'Content-Type': 'application/json'} }).then(() => alert('Liked!'))} className="text-xs px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300">👍 Like</button>
                       <button onClick={() => fetch('/api/admin/vote', { method: 'POST', body: JSON.stringify({ questionId: currentQuestion.id, voteType: -1 }), headers: {'Content-Type': 'application/json'} }).then(() => alert('Disliked!'))} className="text-xs px-3 py-1.5 rounded bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300">👎 Dislike</button>
                       <button onClick={() => { const reason = prompt('Reason for reporting?'); if(reason) fetch('/api/admin/report', { method: 'POST', body: JSON.stringify({ questionId: currentQuestion.id, reason }), headers: {'Content-Type': 'application/json'} }).then(() => alert('Reported!')); }} className="text-xs px-3 py-1.5 rounded bg-rose-950/30 hover:bg-rose-900/40 border border-rose-900/50 text-rose-400 ml-auto">🚨 Report</button>
                    </div>
                  )}

              {/* Feedback Panel */}
              {currentQuestionAnswer && (
                <div className="animate-fade-up space-y-6">
                  {/* Explanation */}
                  <div
                    className={`p-5 rounded-lg border ${
                      currentQuestionAnswer.correct ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'
                    }`}
                  >
                    <h3 className={`font-semibold mb-2 ${currentQuestionAnswer.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {currentQuestionAnswer.correct ? 'Correct!' : 'Incorrect.'}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{currentQuestionAnswer.explanation}</p>

                    {/* Secondary Action: Explain Further with AI & Response Time */}
                    <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between flex-wrap gap-2">
                      <ExplainFurtherButton />

                      {currentQuestionAnswer.response_time_ms > 0 && (
                        <span className="text-xs text-zinc-500 font-mono">
                            Answered in {(currentQuestionAnswer.response_time_ms / 1000).toFixed(1)}s
                          </span>
                      )}
                    </div>
                  </div>

                  {/* Export & Share Section */}
                  <ExportShareSection
                    copyState={copyState}
                    onCopyMarkdown={handleCopyMarkdown}
                    onDownloadFullQuestion={handleDownloadFullQuestion}
                    onDownloadCodeSnippet={handleDownloadPng}
                    hasCodeSnippet={Boolean(currentQuestion.code_snippet)}
                  />

                  {/* Navigation */}
                  <div className="flex gap-3 pt-4 border-t border-zinc-800">
                    <button
                      onClick={handlePrevious}
                      disabled={currentQuestionIndex === 0}
                      className="px-4 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ← Previous
                    </button>

                    {currentQuestionIndex < activeQuestions.length - 1 ? (
                      <button
                        onClick={handleNext}
                        className="px-4 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors"
                      >
                        Next →
                      </button>
                    ) : allOfficialAnswered && !communityUnlocked && communityQuestions.length > 0 ? (
                      <button
                        onClick={() => { setCommunityUnlocked(true); handleNext(); }}
                        className="flex-1 px-4 py-2 text-sm rounded-lg bg-indigo-950/30 border border-indigo-900/50 hover:bg-indigo-900/40 text-indigo-400 transition-colors flex items-center justify-center font-semibold"
                      >
                        Take 2 Extra Community Questions 🌟
                      </button>
                    ) : allAnswered ? (
                      <div className="flex-1 px-4 py-2 text-sm rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-emerald-400 flex items-center justify-center font-semibold">
                        All questions answered!
                      </div>
                    ) : null}

                    {/* Reset Button */}
                    {allAnswered && (
                      <button
                        onClick={handleReset}
                        className="px-4 py-2 text-sm rounded-lg border border-amber-800/60 bg-amber-950/30 hover:bg-amber-900/40 text-amber-400 hover:text-amber-300 transition-colors"
                      >
                        Reset & Retry
                      </button>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right Sidebar - Avatar, Monitor Me Widget, and Tips */}
        <div className="w-full lg:w-56 space-y-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-3">
            {userLoaded && (
              <>
                <Avatar 
                  visible={avatarVisible} 
                  username={user?.username || 'Guest'} 
                  avatarConfig={user?.avatar_config}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setAvatarVisible(!avatarVisible)}
                    className="text-xs px-3 py-1.5 rounded-md border border-zinc-700 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-300 transition-colors duration-200"
                  >
                    {avatarVisible ? 'Hide' : 'Show'} Avatar
                  </button>
                  {user?.role === 'admin' && (
                    <a
                      href="/admin/dashboard"
                      className="text-xs px-3 py-1.5 rounded-md border border-indigo-500/30 bg-indigo-900/30 hover:bg-indigo-900/50 text-indigo-400 hover:text-indigo-300 transition-colors duration-200 font-medium"
                    >
                      Admin UI
                    </a>
                  )}
                </div>
              </>
            )}
            {!userLoaded && (
              <div className="w-32 h-32 rounded-full bg-zinc-800/50 animate-pulse" />
            )}
          </div>

          {/* Monitor Me Sidebar Widget */}
          <MonitorMeWidget
            analytics={analytics}
            onOpenModal={() => setIsMonitorMeOpen(true)}
          />

          {/* Library Stats */}
          <QuestionStatsWidget counts={globalStats} />

          {/* Tips Feed */}
          <TipsFeed />
        </div>
      </main>

      {/* Monitor Me Expanded Modal */}
      <MonitorMeModal
        isOpen={isMonitorMeOpen}
        onClose={() => setIsMonitorMeOpen(false)}
        analytics={analytics}
        user={user}
      />
    </div>
  );
}
