export default function StreakDisplay({ currentStreak, bestStreak, questionsToday, totalQuestions = 4 }) {
  const streakPercentage = (questionsToday / totalQuestions) * 100;

  return (
    <div className="bg-gradient-to-r from-orange-400 to-red-500 rounded-lg shadow-lg p-6 text-white mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Current Streak */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">🔥</div>
          <p className="text-sm opacity-90">Current Streak</p>
          <p className="text-3xl font-bold">{currentStreak}</p>
        </div>

        {/* Best Streak */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">⭐</div>
          <p className="text-sm opacity-90">Best Streak</p>
          <p className="text-3xl font-bold">{bestStreak}</p>
        </div>

        {/* Today's Progress */}
        <div className="text-center">
          <div className="text-4xl font-bold mb-2">📊</div>
          <p className="text-sm opacity-90">Today's Questions</p>
          <p className="text-3xl font-bold">{questionsToday}/{totalQuestions}</p>
          <div className="w-full bg-white bg-opacity-30 rounded-full h-2 mt-2">
            <div
              className="bg-white h-2 rounded-full transition-all duration-300"
              style={{ width: `${streakPercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* Milestone message */}
      <div className="mt-4 text-center">
        {questionsToday === totalQuestions && (
          <p className="text-lg font-semibold animate-pulse">
            🎉 You've completed today's challenge! Come back tomorrow!
          </p>
        )}
        {questionsToday < totalQuestions && currentStreak > 0 && (
          <p className="text-sm">
            {totalQuestions - questionsToday} more question{totalQuestions - questionsToday !== 1 ? 's' : ''} to complete today's challenge
          </p>
        )}
      </div>
    </div>
  );
}
