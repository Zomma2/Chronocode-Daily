import React, { useEffect, useState } from 'react';

function formatTimer(seconds) {
  const m = Math.floor(seconds / 60);
  const s = (seconds % 60).toFixed(1);
  if (m > 0) {
    const wholeSec = Math.floor(seconds % 60);
    return `${m}m ${wholeSec < 10 ? '0' : ''}${wholeSec}s`;
  }
  return `${s}s`;
}

export default function QuestionTimer({
  isRunning = true,
  isAnswered = false,
  finalTimeMs = 0,
  onTick = null,
  className = '',
}) {
  const [elapsedMs, setElapsedMs] = useState(0);

  useEffect(() => {
    if (isAnswered) {
      if (finalTimeMs > 0) {
        setElapsedMs(finalTimeMs);
      }
      return;
    }

    setElapsedMs(0);
    if (!isRunning) return;

    const start = Date.now();
    const interval = setInterval(() => {
      const now = Date.now();
      const currentElapsed = now - start;
      setElapsedMs(currentElapsed);
      if (onTick) {
        onTick(currentElapsed);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isRunning, isAnswered, finalTimeMs, onTick]);

  const displaySeconds = elapsedMs / 1000;

  return (
    <div
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-zinc-900/90 border border-zinc-800/80 text-xs font-mono select-none ${
        isAnswered
          ? 'text-emerald-400/90 border-emerald-900/40 bg-emerald-950/20'
          : 'text-zinc-400'
      } ${className}`}
      title={isAnswered ? `Answered in ${displaySeconds.toFixed(1)}s` : 'Time elapsed'}
    >
      {isAnswered ? (
        <svg className="w-3 h-3 text-emerald-400 shrink-0" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      ) : (
        <span className="relative flex h-2 w-2">
          {isRunning && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          )}
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
        </span>
      )}

      <span className="font-mono tabular-nums tracking-tight">
        {formatTimer(displaySeconds)}
      </span>
    </div>
  );
}
