// Central analytics calculations for "Monitor Me"
// Reusable across server API and client components (including guest offline/localStorage mode)

export const DEFAULT_TOPICS = [
  'Iterators',
  'Closures',
  'Async/Event Loop',
  'Memory Management',
  'Modules & Core',
  'Types & Built-ins',
];

export function toDateKey(dateInput) {
  if (!dateInput) return new Date().toISOString().slice(0, 10);
  if (typeof dateInput === 'string') {
    return dateInput.slice(0, 10);
  }
  return new Date(dateInput).toISOString().slice(0, 10);
}

export function generate60DayGrid(attemptsByDate) {
  const grid = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  // Generate 60 days from 59 days ago up to today
  for (let i = 59; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayData = attemptsByDate[dateStr] || { count: 0, correctCount: 0 };
    const count = dayData.count || 0;
    const correctCount = dayData.correctCount || 0;

    let level = 0;
    if (count >= 4) {
      level = 3; // Completed daily challenge or high activity
    } else if (count >= 3) {
      level = 2;
    } else if (count >= 1) {
      level = 1;
    }

    grid.push({
      date: dateStr,
      dayOfWeek: d.getUTCDay(), // 0 = Sunday
      count,
      correctCount,
      accuracy: count > 0 ? Math.round((correctCount / count) * 100) : 0,
      completed: count >= 4,
      level,
    });
  }

  return grid;
}

export function calculateAnalytics(attempts = [], streaks = []) {
  const list = Array.isArray(attempts) ? attempts : [];

  const totalAttempts = list.length;
  let correctCount = 0;
  let totalTimeMs = 0;
  let validTimeCount = 0;

  const trackStats = {
    python: { total: 0, correct: 0, totalTimeMs: 0, timeCount: 0 },
    node: { total: 0, correct: 0, totalTimeMs: 0, timeCount: 0 },
  };

  const topicMap = {};
  for (const topic of DEFAULT_TOPICS) {
    topicMap[topic] = { total: 0, correct: 0, totalTimeMs: 0, timeCount: 0 };
  }

  const difficultyMap = {
    Easy: { total: 0, correct: 0 },
    Medium: { total: 0, correct: 0 },
    Hard: { total: 0, correct: 0 },
  };

  const attemptsByDate = {};
  const speedAccuracy = {
    fast: { total: 0, correct: 0 },    // < 5s
    medium: { total: 0, correct: 0 },  // 5s - 15s
    deliberate: { total: 0, correct: 0 }, // > 15s
  };

  for (const a of list) {
    const isCorrect = Boolean(a.is_correct);
    if (isCorrect) correctCount++;

    const timeMs = Number(a.response_time_ms) || 0;
    if (timeMs > 0) {
      totalTimeMs += timeMs;
      validTimeCount++;

      const seconds = timeMs / 1000;
      if (seconds < 5) {
        speedAccuracy.fast.total++;
        if (isCorrect) speedAccuracy.fast.correct++;
      } else if (seconds <= 15) {
        speedAccuracy.medium.total++;
        if (isCorrect) speedAccuracy.medium.correct++;
      } else {
        speedAccuracy.deliberate.total++;
        if (isCorrect) speedAccuracy.deliberate.correct++;
      }
    }

    // Track
    const rawTrack = (a.track || '').toLowerCase();
    const track = rawTrack === 'node' ? 'node' : rawTrack === 'python' ? 'python' : null;
    if (track && trackStats[track]) {
      trackStats[track].total++;
      if (isCorrect) trackStats[track].correct++;
      if (timeMs > 0) {
        trackStats[track].totalTimeMs += timeMs;
        trackStats[track].timeCount++;
      }
    }

    // Topic
    const topic = a.topic || 'General';
    if (!topicMap[topic]) {
      topicMap[topic] = { total: 0, correct: 0, totalTimeMs: 0, timeCount: 0 };
    }
    topicMap[topic].total++;
    if (isCorrect) topicMap[topic].correct++;
    if (timeMs > 0) {
      topicMap[topic].totalTimeMs += timeMs;
      topicMap[topic].timeCount++;
    }

    // Difficulty
    const diff = a.difficulty || 'Medium';
    if (difficultyMap[diff]) {
      difficultyMap[diff].total++;
      if (isCorrect) difficultyMap[diff].correct++;
    }

    // Date aggregation
    const dateKey = toDateKey(a.attempt_date || a.created_at || a.answered_at);
    if (!attemptsByDate[dateKey]) {
      attemptsByDate[dateKey] = { count: 0, correctCount: 0 };
    }
    attemptsByDate[dateKey].count++;
    if (isCorrect) attemptsByDate[dateKey].correctCount++;
  }

  const incorrectCount = totalAttempts - correctCount;
  const overallAccuracyRate = totalAttempts > 0
    ? Number(((correctCount / totalAttempts) * 100).toFixed(1))
    : 0;

  const averageTimeMs = validTimeCount > 0 ? Math.round(totalTimeMs / validTimeCount) : 0;
  const averageTimeSeconds = averageTimeMs > 0 ? Number((averageTimeMs / 1000).toFixed(1)) : 0;

  // Streak calculations
  let currentStreak = 0;
  let longestStreak = 0;

  if (Array.isArray(streaks) && streaks.length > 0) {
    for (const s of streaks) {
      if ((s.current_streak || 0) > currentStreak) {
        currentStreak = s.current_streak;
      }
      if ((s.best_streak || 0) > longestStreak) {
        longestStreak = s.best_streak;
      }
    }
  } else {
    // Compute from activity dates
    const dateKeys = Object.keys(attemptsByDate).sort();
    let tempStreak = 0;
    let maxStreak = 0;
    let prevDate = null;

    for (const dStr of dateKeys) {
      const d = new Date(dStr);
      if (prevDate) {
        const diffDays = Math.round((d.getTime() - prevDate.getTime()) / (1000 * 3600 * 24));
        if (diffDays === 1) {
          tempStreak++;
        } else if (diffDays > 1) {
          tempStreak = 1;
        }
      } else {
        tempStreak = 1;
      }
      prevDate = d;
      if (tempStreak > maxStreak) maxStreak = tempStreak;
    }

    // Check if streak is active today or yesterday
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    const lastActive = dateKeys[dateKeys.length - 1];

    if (lastActive === today || lastActive === yesterday) {
      currentStreak = tempStreak;
    } else {
      currentStreak = 0;
    }
    longestStreak = Math.max(maxStreak, currentStreak);
  }

  // Track breakdown
  const trackBreakdown = {
    python: {
      total: trackStats.python.total,
      correct: trackStats.python.correct,
      incorrect: trackStats.python.total - trackStats.python.correct,
      accuracy: trackStats.python.total > 0
        ? Number(((trackStats.python.correct / trackStats.python.total) * 100).toFixed(1))
        : 0,
      avgTimeSeconds: trackStats.python.timeCount > 0
        ? Number((trackStats.python.totalTimeMs / trackStats.python.timeCount / 1000).toFixed(1))
        : 0,
    },
    node: {
      total: trackStats.node.total,
      correct: trackStats.node.correct,
      incorrect: trackStats.node.total - trackStats.node.correct,
      accuracy: trackStats.node.total > 0
        ? Number(((trackStats.node.correct / trackStats.node.total) * 100).toFixed(1))
        : 0,
      avgTimeSeconds: trackStats.node.timeCount > 0
        ? Number((trackStats.node.totalTimeMs / trackStats.node.timeCount / 1000).toFixed(1))
        : 0,
    },
  };

  // Topic mastery breakdown
  const topicMastery = Object.entries(topicMap).map(([topic, stats]) => {
    const accuracy = stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0;
    let masteryLevel = 'Untested';
    if (stats.total >= 3) {
      if (accuracy >= 80) masteryLevel = 'Mastered';
      else if (accuracy >= 60) masteryLevel = 'Proficient';
      else masteryLevel = 'Needs Review';
    } else if (stats.total > 0) {
      masteryLevel = accuracy >= 50 ? 'Learning' : 'Needs Review';
    }

    return {
      topic,
      total: stats.total,
      correct: stats.correct,
      accuracy,
      avgTimeSeconds: stats.timeCount > 0 ? Number((stats.totalTimeMs / stats.timeCount / 1000).toFixed(1)) : 0,
      masteryLevel,
    };
  }).sort((a, b) => b.total - a.total || b.accuracy - a.accuracy);

  // Difficulty breakdown
  const difficultyBreakdown = {
    Easy: {
      total: difficultyMap.Easy.total,
      correct: difficultyMap.Easy.correct,
      accuracy: difficultyMap.Easy.total > 0 ? Math.round((difficultyMap.Easy.correct / difficultyMap.Easy.total) * 100) : 0,
    },
    Medium: {
      total: difficultyMap.Medium.total,
      correct: difficultyMap.Medium.correct,
      accuracy: difficultyMap.Medium.total > 0 ? Math.round((difficultyMap.Medium.correct / difficultyMap.Medium.total) * 100) : 0,
    },
    Hard: {
      total: difficultyMap.Hard.total,
      correct: difficultyMap.Hard.correct,
      accuracy: difficultyMap.Hard.total > 0 ? Math.round((difficultyMap.Hard.correct / difficultyMap.Hard.total) * 100) : 0,
    },
  };

  const activityCalendar = generate60DayGrid(attemptsByDate);
  const activeDaysCount = activityCalendar.filter(d => d.count > 0).length;

  return {
    totalAttempts,
    correctCount,
    incorrectCount,
    overallAccuracyRate,
    averageTimeSeconds,
    averageTimeMs,
    currentStreak,
    longestStreak,
    trackBreakdown,
    topicMastery,
    difficultyBreakdown,
    speedAccuracy: {
      fast: {
        ...speedAccuracy.fast,
        accuracy: speedAccuracy.fast.total > 0 ? Math.round((speedAccuracy.fast.correct / speedAccuracy.fast.total) * 100) : 0,
      },
      medium: {
        ...speedAccuracy.medium,
        accuracy: speedAccuracy.medium.total > 0 ? Math.round((speedAccuracy.medium.correct / speedAccuracy.medium.total) * 100) : 0,
      },
      deliberate: {
        ...speedAccuracy.deliberate,
        accuracy: speedAccuracy.deliberate.total > 0 ? Math.round((speedAccuracy.deliberate.correct / speedAccuracy.deliberate.total) * 100) : 0,
      },
    },
    activityCalendar,
    activeDaysCount,
    recentAttempts: list.slice(0, 10),
  };
}

// Client-side helper for guest users
const GUEST_ATTEMPTS_KEY = 'codebits:monitor_me_attempts';

export function getGuestAttempts() {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(GUEST_ATTEMPTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

export function saveGuestAttempt(attempt) {
  if (typeof window === 'undefined') return [];
  try {
    const existing = getGuestAttempts();
    const item = {
      id: Date.now(),
      created_at: new Date().toISOString(),
      attempt_date: new Date().toISOString().slice(0, 10),
      ...attempt,
    };
    const updated = [item, ...existing].slice(0, 300); // keep last 300
    window.localStorage.setItem(GUEST_ATTEMPTS_KEY, JSON.stringify(updated));
    return updated;
  } catch (err) {
    return [];
  }
}
