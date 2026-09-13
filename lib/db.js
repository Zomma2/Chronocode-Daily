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
  // Python questions (at least 4)
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
  {
    id: questionCounter++,
    track: 'python',
    question_text: 'What will be the output of: len("hello")?',
    code_snippet: 'print(len("hello"))',
    options: JSON.stringify(['4', '5', '6', 'Error']),
    correct_index: 1,
    explanation: 'The len() function returns the number of characters in a string. "hello" has 5 characters.',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
  {
    id: questionCounter++,
    track: 'python',
    question_text: 'What is the output of list(range(3))?',
    code_snippet: 'print(list(range(3)))',
    options: JSON.stringify(['[0, 1, 2, 3]', '[0, 1, 2]', '[1, 2, 3]', '[0, 3]']),
    correct_index: 1,
    explanation: 'range(3) generates numbers from 0 to 2 (not including 3). list() converts it to a list.',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
  {
    id: questionCounter++,
    track: 'python',
    question_text: 'Which method removes and returns the last item from a list?',
    code_snippet: 'my_list = [1, 2, 3]\nmy_list.pop()',
    options: JSON.stringify(['remove()', 'pop()', 'delete()', 'discard()']),
    correct_index: 1,
    explanation: 'The pop() method removes and returns the last item in the list. remove() only removes by value, not by index.',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
  // JavaScript questions (at least 4)
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
    track: 'javascript',
    question_text: 'What does console.log(0.1 + 0.2 === 0.3) output?',
    code_snippet: 'console.log(0.1 + 0.2 === 0.3);',
    options: JSON.stringify(['true', 'false', 'undefined', 'NaN']),
    correct_index: 1,
    explanation: 'Due to floating-point precision issues, 0.1 + 0.2 is not exactly 0.3 in JavaScript. It outputs false.',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
  {
    id: questionCounter++,
    track: 'javascript',
    question_text: 'What is the result of console.log([1,2,3].join("-"))?',
    code_snippet: 'console.log([1,2,3].join("-"));',
    options: JSON.stringify(['1,2,3', '1-2-3', '[1-2-3]', 'undefined']),
    correct_index: 1,
    explanation: 'The join() method combines array elements into a string using the specified separator.',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
  {
    id: questionCounter++,
    track: 'javascript',
    question_text: 'What is the output of typeof []?',
    code_snippet: 'console.log(typeof []);',
    options: JSON.stringify(['array', 'object', 'list', 'undefined']),
    correct_index: 1,
    explanation: 'In JavaScript, arrays are objects. typeof [] returns "object".',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
  // Node.js questions (at least 4)
  {
    id: questionCounter++,
    track: 'node',
    question_text: 'Which core Node.js module is used for file system operations?',
    code_snippet: 'const fs = require("fs");',
    options: JSON.stringify(['fs', 'file', 'io', 'system']),
    correct_index: 0,
    explanation: 'The fs module provides file system operations like reading and writing files.',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
  {
    id: questionCounter++,
    track: 'node',
    question_text: 'What does require() return in Node.js?',
    code_snippet: 'const express = require("express");',
    options: JSON.stringify(['a module object', 'a string', 'undefined', 'a function']),
    correct_index: 0,
    explanation: 'require() loads a module and returns the exported value from that module.',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
  {
    id: questionCounter++,
    track: 'node',
    question_text: 'Which global object represents the current directory in Node.js?',
    code_snippet: 'console.log(__dirname);',
    options: JSON.stringify(['__dirname', '__filename', 'process.cwd()', 'global.dir']),
    correct_index: 0,
    explanation: '__dirname is a global variable in Node.js that contains the absolute path of the current directory.',
    scheduled_date: new Date().toISOString().split('T')[0],
  },
  {
    id: questionCounter++,
    track: 'node',
    question_text: 'What is the purpose of package.json in Node.js?',
    code_snippet: 'cat package.json',
    options: JSON.stringify(['defines project metadata and dependencies', 'stores user passwords', 'compiles TypeScript', 'runs tests only']),
    correct_index: 0,
    explanation: 'package.json is a manifest file that contains project metadata, dependencies, scripts, and other configuration.',
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
  {
    id: tipsCounter++,
    track: 'node',
    tip_text: 'Use the fs.promises API instead of callback-based methods for cleaner async/await code in Node.js.',
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

export function getRandomQuestions(track, count = 4) {
  const questions = store.questions.filter(q => q.track === track);
  if (questions.length === 0) return [];
  
  // Shuffle and pick unique questions
  const shuffled = [...questions].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, Math.min(count, questions.length));
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
  getRandomQuestions,
  getPostBySlug,
  getAllPosts,
  getPostsByTrack,
  addQuestion,
  addTip,
  addPost,
};
