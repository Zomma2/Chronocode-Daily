const STREAK_KEY = 'codebits:streak';

function isoWeekDates() {
  const now = new Date();
  const day = (now.getUTCDay() + 6) % 7; // Monday = 0
  const monday = new Date(now);
  monday.setUTCDate(now.getUTCDate() - day);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return d.toISOString().slice(0, 10);
  });
}

export function recordAnsweredToday(date) {
  if (typeof window === 'undefined') return;
  const raw = window.localStorage.getItem(STREAK_KEY);
  const days = raw ? JSON.parse(raw) : [];
  if (!days.includes(date)) {
    days.push(date);
    window.localStorage.setItem(STREAK_KEY, JSON.stringify(days));
  }
}

export function getWeeklyProgress() {
  if (typeof window === 'undefined') return { answered: 0, total: 7 };
  const raw = window.localStorage.getItem(STREAK_KEY);
  const days = raw ? JSON.parse(raw) : [];
  const week = isoWeekDates();
  const answered = week.filter((d) => days.includes(d)).length;
  return { answered, total: 7 };
}
