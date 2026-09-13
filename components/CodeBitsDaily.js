import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import TipsFeed from './TipsFeed';
import CodeBlock from './CodeBlock';
import ProgressBar from './ProgressBar';
import { getWeeklyProgress, recordAnsweredToday } from '../lib/streak';
import { playTone, triggerHaptic } from '../lib/feedback';
import { buildMarkdown, copyToClipboard } from '../lib/exportMarkdown';
import { downloadCodeSnippetPng } from '../lib/exportPng';

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

function storageKey(date, track) {
  return `codebits:${date}:${track}`;
}

function CodeSkeleton() {
  const widths = ['w-2/3', 'w-full', 'w-5/6', 'w-1/2'];
  return (
    <div className="bg-zinc-950 rounded-lg p-4 mb-8 border border-zinc-800/50 space-y-2.5">
      {widths.map((w, i) => (
        <div key={i} className={`skeleton animate-shimmer h-3.5 ${w} rounded`} />
      ))}
    </div>
  );
}

function ChallengeSkeleton() {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl mb-8 animate-fade-in">
      <div className="p-6 md:p-8">
        <div className="skeleton animate-shimmer h-5 w-3/4 rounded mb-6" />
        <CodeSkeleton />
        <div className="space-y-3">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skeleton animate-shimmer h-12 w-full rounded-lg" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function CodeBitsDaily() {
  const [track, setTrack] = useState('python');
  const [question, setQuestion] = useState(null);
  const [tip, setTip] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [result, setResult] = useState(null); // { correct, explanation, correct_index }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(() => formatCountdown(msUntilNextUTCMidnight()));
  const [verifying, setVerifying] = useState(false);
  const [progress, setProgress] = useState({ answered: 0, total: 7 });
  const [copyState, setCopyState] = useState('idle'); // idle | copied

  const pythonTabRef = useRef(null);
  const nodeTabRef = useRef(null);
  const [indicatorStyle, setIndicatorStyle] = useState({});

  const date = useMemo(() => todayUTC(), []);
  const hasAnswered = Boolean(result);

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
    setLoading(true);
    setError(null);
    setSelectedIndex(null);
    setResult(null);
    setQuestion(null);
    setTip(null);

    try {
      const [challengeRes, tipRes] = await Promise.all([
        fetch(`/api/daily-challenge?track=${track}`),
        fetch(`/api/daily-tip?track=${track}`),
      ]);

      if (!challengeRes.ok) throw new Error('No challenge available for today');
      const challengeData = await challengeRes.json();
      const tipData = tipRes.ok ? await tipRes.json() : null;

      setQuestion(challengeData);
      setTip(tipData);

      const stored = window.localStorage.getItem(storageKey(date, track));
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.question_id === challengeData.id) {
          setSelectedIndex(parsed.selected_index);
          setResult({
            correct: parsed.correct,
            explanation: parsed.explanation,
            correct_index: parsed.correct_index,
          });
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [track, date]);

  useEffect(() => {
    let cancelled = false;
    load().catch(() => {});
    return () => {
      cancelled = true;
      void cancelled;
    };
  }, [load]);

  const handleSelect = async (index) => {
    if (hasAnswered || !question || verifying) return;
    setSelectedIndex(index);
    setVerifying(true);

    try {
      const res = await fetch('/api/verify-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: question.id, selected_index: index }),
      });
      if (!res.ok) throw new Error('Could not verify answer');
      const data = await res.json();
      setResult(data);
      window.localStorage.setItem(
        storageKey(date, track),
        JSON.stringify({
          question_id: question.id,
          selected_index: index,
          correct: data.correct,
          explanation: data.explanation,
          correct_index: data.correct_index,
        })
      );
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
    if (!question) return;
    const markdown = buildMarkdown({ question, track, result });
    const copied = await copyToClipboard(markdown);
    if (copied) {
      setCopyState('copied');
      setTimeout(() => setCopyState('idle'), 2000);
    }
  };

  const handleDownloadPng = () => {
    if (!question || !question.code_snippet) return;
    downloadCodeSnippetPng({ code: question.code_snippet, track, date: question.scheduled_date });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans selection:bg-emerald-900/50">
      <ProgressBar progress={progress} />

      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
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
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-12 flex flex-col lg:flex-row gap-10 items-start">
        <div className="flex-1 w-full max-w-3xl mx-auto lg:mx-0">
          {loading && <ChallengeSkeleton />}

          {!loading && error && !question && (
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

          {!loading && question && (
            <>
              {/* Challenge Card */}
              <div
                key={question.id}
                className="animate-scale-in bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl mb-8 transition-shadow hover:shadow-emerald-950/20"
              >
                <div className="p-6 md:p-8">
                  <h2 className="text-lg md:text-xl font-medium text-zinc-100 mb-6">
                    {question.question_text}
                  </h2>

                  {/* Code Block */}
                  {question.code_snippet && (
                    <CodeBlock code={question.code_snippet} track={track} className="mb-8" />
                  )}

                  {/* Options */}
                  <div className="space-y-3">
                    {question.options.map((option, index) => {
                      const isSelected = selectedIndex === index;
                      const isCorrect = hasAnswered && index === result.correct_index;
                      const isWrongPick = hasAnswered && isSelected && !isCorrect;

                      let buttonStyle = 'bg-zinc-950 border-zinc-800 hover:border-zinc-600 text-zinc-300';

                      if (hasAnswered) {
                        if (isCorrect) {
                          buttonStyle = 'bg-emerald-950/30 border-emerald-500 text-emerald-400';
                        } else if (isWrongPick) {
                          buttonStyle = 'bg-rose-950/30 border-rose-500 text-rose-400';
                        } else {
                          buttonStyle = 'bg-zinc-950 border-zinc-800 opacity-50';
                        }
                      } else if (isSelected) {
                        // Immediate 300ms color shift confirming the pick while verification is in flight.
                        buttonStyle = 'bg-zinc-800 border-zinc-500 text-white';
                      }

                      return (
                        <div key={index} className="relative group">
                          <button
                            onClick={() => handleSelect(index)}
                            disabled={hasAnswered}
                            style={{ animationDelay: `${index * 60}ms` }}
                            className={`animate-fade-up opacity-0 w-full text-left px-5 py-4 rounded-lg border transition-colors duration-300 font-mono text-sm ${buttonStyle} ${
                              !hasAnswered && 'hover:bg-zinc-900 hover:scale-[1.01] active:scale-[0.99] cursor-pointer transition-transform duration-150'
                            } ${isSelected && !hasAnswered ? 'animate-pop-in' : ''}`}
                          >
                            <span className="mr-4 text-zinc-500">{['A', 'B', 'C', 'D'][index]}</span>
                            {option}
                          </button>

                          {/* Explainer tooltip for incorrect options, revealed on hover after answering */}
                          {hasAnswered && !isCorrect && (
                            <div className="pointer-events-none absolute left-5 -bottom-2 translate-y-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                              <div className="bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs rounded-md px-3 py-2 shadow-lg max-w-xs">
                                {isWrongPick ? 'Not quite — see the explanation below.' : 'Not the answer for today — keep it in mind for next time.'}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Feedback & Tip Panel (Revealed after answering) */}
              {hasAnswered && (
                <div className="animate-fade-up space-y-6">
                  {/* Explanation */}
                  <div
                    className={`p-5 rounded-lg border ${
                      result.correct ? 'bg-emerald-950/20 border-emerald-900/50' : 'bg-rose-950/20 border-rose-900/50'
                    }`}
                  >
                    <h3 className={`font-semibold mb-2 ${result.correct ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {result.correct ? 'Correct!' : 'Incorrect.'}
                    </h3>
                    <p className="text-zinc-400 text-sm leading-relaxed">{result.explanation}</p>
                  </div>

                  {/* Export actions */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handleCopyMarkdown}
                      className="px-4 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors duration-200"
                    >
                      {copyState === 'copied' ? 'Copied to clipboard ✓' : 'Copy as Markdown'}
                    </button>
                    {question.code_snippet && (
                      <button
                        onClick={handleDownloadPng}
                        className="px-4 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors duration-200"
                      >
                        Download snippet PNG
                      </button>
                    )}
                  </div>

                  {/* Info for Today */}
                  <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex flex-col md:flex-row md:items-start gap-6 transition-colors hover:border-zinc-700">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold tracking-wider text-zinc-500 uppercase mb-3">Info For Today</h3>
                      <p className="text-zinc-200 text-sm leading-relaxed">
                        {tip ? tip.tip_text : 'No tip scheduled for today.'}
                      </p>
                    </div>
                    <div className="md:w-32 flex flex-col justify-center items-center p-4 bg-zinc-950 rounded-lg border border-zinc-800">
                      <span className="text-xs text-zinc-500 mb-1">Next Question</span>
                      <span className="text-lg font-mono font-medium text-zinc-300 tabular-nums">{countdown}</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <TipsFeed />
      </main>
    </div>
  );
}

