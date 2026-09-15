import React from 'react';

export default function StreakDisplay({ currentStreak = 0, bestStreak = 0, questionsToday = 0, totalQuestions = 4 }) {
  const streakPercentage = Math.min(100, Math.round(((questionsToday || 0) / (totalQuestions || 4)) * 100));

  return (
    <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 rounded-xl shadow-xl p-5 sm:p-6 text-white mb-6 border border-amber-400/30">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        {/* Current Streak */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-lg bg-black/15 backdrop-blur-sm border border-white/10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-amber-400/20 border border-amber-300/30 text-amber-200 mb-2 shadow-inner">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Current Streak</p>
          <p className="text-3xl font-extrabold tracking-tight mt-0.5 font-mono">{currentStreak}</p>
        </div>

        {/* Best Streak */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-lg bg-black/15 backdrop-blur-sm border border-white/10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-yellow-400/20 border border-yellow-300/30 text-yellow-200 mb-2 shadow-inner">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
              <path
                fillRule="evenodd"
                d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Best Streak</p>
          <p className="text-3xl font-extrabold tracking-tight mt-0.5 font-mono">{bestStreak}</p>
        </div>

        {/* Today's Progress */}
        <div className="flex flex-col items-center justify-center p-3.5 rounded-lg bg-black/15 backdrop-blur-sm border border-white/10 text-center">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white/20 border border-white/30 text-white mb-2 shadow-inner">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <path d="m9 12 2 2 4-4" />
            </svg>
          </div>
          <p className="text-xs uppercase tracking-wider font-semibold opacity-90">Today's Questions</p>
          <p className="text-3xl font-extrabold tracking-tight mt-0.5 font-mono">
            {questionsToday}/{totalQuestions}
          </p>
          <div className="w-full bg-black/30 rounded-full h-2 mt-2.5 overflow-hidden border border-white/20">
            <div
              className="bg-white h-full rounded-full transition-all duration-500 shadow-sm"
              style={{ width: `${streakPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestone message */}
      <div className="mt-4 text-center">
        {questionsToday >= totalQuestions && (
          <p className="text-sm sm:text-base font-bold tracking-wide animate-pulse bg-black/25 py-1.5 px-4 rounded-full inline-block border border-white/20">
            You have completed today's challenge! Come back tomorrow!
          </p>
        )}
        {questionsToday < totalQuestions && currentStreak > 0 && (
          <p className="text-xs sm:text-sm font-medium opacity-95">
            {totalQuestions - questionsToday} more question{totalQuestions - questionsToday !== 1 ? 's' : ''} to complete today's challenge
          </p>
        )}
      </div>
    </div>
  );
}
