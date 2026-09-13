import bcrypt from 'bcryptjs';

// In-memory storage (for production, use a real database like PostgreSQL)
const users = new Map();
const streaks = new Map();
const languageStreaks = new Map();
const userAnswers = [];

let nextUserId = 1;

export async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function initializeUserTables() {
  console.log('Initialized user tables (in-memory)');
}

export async function createUser(email, username, password) {
  // Check if user already exists
  if (Array.from(users.values()).some(u => u.email === email)) {
    throw new Error('Email already exists');
  }
  
  if (Array.from(users.values()).some(u => u.username === username)) {
    throw new Error('Username already exists');
  }
  
  const passwordHash = await hashPassword(password);
  const userId = nextUserId++;
  
  const user = {
    id: userId,
    email,
    username,
    password_hash: passwordHash,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  
  users.set(userId, user);
  
  // Initialize streak record
  streaks.set(userId, {
    id: userId,
    user_id: userId,
    current_streak: 0,
    best_streak: 0,
    total_questions_answered: 0,
    last_answered_date: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  
  return {
    id: userId,
    email,
    username,
  };
}

export async function getUserByEmail(email) {
  return Array.from(users.values()).find(u => u.email === email);
}

export async function getUserByUsername(username) {
  return Array.from(users.values()).find(u => u.username === username);
}

export async function getUserById(id) {
  const user = users.get(id);
  if (!user) return null;
  
  const { password_hash, ...safeUser } = user;
  return safeUser;
}

export async function authenticateUser(email, password) {
  const user = await getUserByEmail(email);
  
  if (!user) {
    return null;
  }
  
  const isValid = await verifyPassword(password, user.password_hash);
  
  if (!isValid) {
    return null;
  }
  
  return {
    id: user.id,
    email: user.email,
    username: user.username,
  };
}

export function getUserStreak(userId) {
  return streaks.get(userId) || null;
}

export function getLanguageStreak(userId, language) {
  const key = `${userId}:${language}`;
  return languageStreaks.get(key) || null;
}

export function updateLanguageStreak(userId, language, isCorrect) {
  const today = new Date().toISOString().split('T')[0];
  const key = `${userId}:${language}`;
  
  let streak = languageStreaks.get(key);
  
  if (!streak) {
    streak = {
      id: languageStreaks.size + 1,
      user_id: userId,
      language,
      questions_answered_today: 0,
      current_streak: 0,
      best_streak: 0,
      last_answered_date: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    languageStreaks.set(key, streak);
  }
  
  let questionsAnsweredToday = streak.questions_answered_today || 0;
  let currentStreak = streak.current_streak || 0;
  let bestStreak = streak.best_streak || 0;
  
  const lastAnsweredDate = streak.last_answered_date;
  const isNewDay = !lastAnsweredDate || lastAnsweredDate !== today;
  
  if (isNewDay) {
    questionsAnsweredToday = 0;
  }
  
  if (isCorrect) {
    questionsAnsweredToday += 1;
    
    // Update streak if 4 correct answers in a day
    if (questionsAnsweredToday % 4 === 0) {
      currentStreak += 1;
      if (currentStreak > bestStreak) {
        bestStreak = currentStreak;
      }
    }
  } else {
    currentStreak = 0;
  }
  
  streak.questions_answered_today = questionsAnsweredToday;
  streak.current_streak = currentStreak;
  streak.best_streak = bestStreak;
  streak.last_answered_date = today;
  streak.updated_at = new Date().toISOString();
  
  languageStreaks.set(key, streak);
  
  userAnswers.push({
    id: userAnswers.length + 1,
    user_id: userId,
    language,
    is_correct: isCorrect,
    answered_at: new Date().toISOString(),
  });
  
  return {
    questionsAnsweredToday,
    currentStreak,
    bestStreak,
    streakIncremented: isCorrect && questionsAnsweredToday % 4 === 0,
  };
}

export function getUserStats(userId) {
  const languageStreaksList = Array.from(languageStreaks.values()).filter(
    s => s.user_id === userId
  );
  
  const userAnswersForUser = userAnswers.filter(a => a.user_id === userId);
  const correctAnswers = userAnswersForUser.filter(a => a.is_correct).length;
  
  return {
    languageStreaks: languageStreaksList,
    totalAnswered: userAnswersForUser.length,
    correctAnswers,
  };
}
