// In-memory database mock for demonstration
// For production, integrate with PostgreSQL or another database

const store = {
  questions: [],
  tips: [],
  posts: [],
};

let questionCounter = 1;
let tipsCounter = 1;
let postsCounter = 1;

// Sample data
const sampleQuestions = [
  {
    id: questionCounter++,
    track: 'javascript',
    question_text: 'What is the output of console.log(typeof null)?',
    code_snippet: 'console.log(typeof null);',
    options: JSON.stringify(['object', 'null', 'undefined', 'boolean']),
    correct_index: 0,
    explanation: 'Due to a quirk in JavaScript, typeof null returns "object". This is actually a bug in the JavaScript spec that couldn\'t be fixed due to backward compatibility.',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
  {
    id: questionCounter++,
    track: 'python',
    question_text: 'What is the difference between == and is in Python?',
    code_snippet: 'a = [1, 2, 3]\nb = [1, 2, 3]\nprint(a == b)\nprint(a is b)',
    options: JSON.stringify(['No difference', '== checks equality, is checks identity', 'is checks equality, == checks identity', 'is is faster']),
    correct_index: 1,
    explanation: '== checks if the values are equal, while is checks if they are the same object in memory.',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
];

const sampleTips = [
  {
    id: tipsCounter++,
    track: 'javascript',
    tip_text: 'Use const by default, let when you need reassignment, and avoid var in modern JavaScript.',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
  {
    id: tipsCounter++,
    track: 'python',
    tip_text: 'Use list comprehensions to write more concise and readable Python code: [x*2 for x in range(10)]',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
];

store.questions = sampleQuestions;
store.tips = sampleTips;

export function getQuestion(track, date) {
  return store.questions.find(q => q.track === track && q.scheduled_date === date);
}

export function getQuestionById(id) {
  return store.questions.find(q => q.id === id);
}

export function getTip(track, date) {
  return store.tips.find(t => t.track === track && t.scheduled_date === date);
}

export function getTipById(id) {
  return store.tips.find(t => t.id === id);
}

export function getRandomQuestion(track) {
  const questions = store.questions.filter(q => q.track === track);
  if (questions.length === 0) return null;
  return questions[Math.floor(Math.random() * questions.length)];
}

export function getRandomTip(track) {
  const tips = store.tips.filter(t => t.track === track);
  if (tips.length === 0) return null;
  return tips[Math.floor(Math.random() * tips.length)];
}

export function getPostBySlug(slug) {
  return store.posts.find(p => p.slug === slug);
}

export function getAllPosts() {
  return store.posts.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));
}

export function getPostsByTrack(track) {
  return store.posts.filter(p => p.track === track);
}

export function addQuestion(data) {
  const question = {
    id: questionCounter++,
    ...data,
  };
  store.questions.push(question);
  return question;
}

export function addTip(data) {
  const tip = {
    id: tipsCounter++,
    ...data,
  };
  store.tips.push(tip);
  return tip;
}

export function addPost(data) {
  const post = {
    id: postsCounter++,
    ...data,
  };
  store.posts.push(post);
  return post;
}

export default {
  getQuestion,
  getQuestionById,
  getTip,
  getTipById,
  getRandomQuestion,
  getRandomTip,
  getPostBySlug,
  getAllPosts,
  getPostsByTrack,
  addQuestion,
  addTip,
  addPost,
};
