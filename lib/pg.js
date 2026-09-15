import { Pool } from 'pg';

let pool;

function getPool() {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      throw new Error('DATABASE_URL is not set');
    }
    // Local/Docker Postgres has no TLS cert; only enable SSL for hosted providers (e.g. Neon).
    const isLocal = /localhost|127\.0\.0\.1|@db:/.test(connectionString);
    pool = new Pool({
      connectionString,
      ssl: isLocal ? false : { rejectUnauthorized: false },
    });
  }
  return pool;
}

export function query(text, params) {
  return getPool().query(text, params);
}

let schemaReady = null;

// Memoized so the CREATE TABLE / seed statements only run once per server process.
export function ensureSchema() {
  if (!schemaReady) {
    schemaReady = initSchema().catch((err) => {
      schemaReady = null; // allow retry on next call if it failed
      throw err;
    });
  }
  return schemaReady;
}

async function initSchema() {
  await query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      avatar_config JSONB,
      avatar_visible BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT now(),
      updated_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS questions (
      id SERIAL PRIMARY KEY,
      track TEXT NOT NULL,
      question_text TEXT NOT NULL,
      code_snippet TEXT,
      options JSONB NOT NULL,
      correct_index INT NOT NULL,
      explanation TEXT,
      difficulty TEXT DEFAULT 'Medium',
      topic TEXT DEFAULT 'General',
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  await query(`
    ALTER TABLE questions ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Medium';
    ALTER TABLE questions ADD COLUMN IF NOT EXISTS topic TEXT DEFAULT 'General';
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS tips (
      id SERIAL PRIMARY KEY,
      track TEXT NOT NULL,
      tip_text TEXT NOT NULL,
      created_at TIMESTAMPTZ DEFAULT now()
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS posts (
      id SERIAL PRIMARY KEY,
      track TEXT NOT NULL,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      excerpt TEXT,
      content TEXT,
      published_at DATE DEFAULT CURRENT_DATE
    )
  `);

  await query(`
    CREATE TABLE IF NOT EXISTS language_streaks (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      language TEXT NOT NULL,
      questions_answered_today INT NOT NULL DEFAULT 0,
      current_streak INT NOT NULL DEFAULT 0,
      best_streak INT NOT NULL DEFAULT 0,
      last_answered_date DATE,
      updated_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, language)
    )
  `);

  // Source of truth for "did this user answer this question today" - fixes
  // progress not being bound to a specific account.
  await query(`
    CREATE TABLE IF NOT EXISTS daily_answers (
      id SERIAL PRIMARY KEY,
      user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      question_id INT NOT NULL REFERENCES questions(id) ON DELETE CASCADE,
      track TEXT NOT NULL,
      answer_date DATE NOT NULL,
      selected_index INT NOT NULL,
      is_correct BOOLEAN NOT NULL,
      correct_index INT NOT NULL,
      explanation TEXT,
      response_time_ms INT DEFAULT 0,
      difficulty TEXT DEFAULT 'Medium',
      topic TEXT DEFAULT 'General',
      answered_at TIMESTAMPTZ DEFAULT now(),
      UNIQUE(user_id, question_id, answer_date)
    )
  `);

  await query(`
    ALTER TABLE daily_answers ADD COLUMN IF NOT EXISTS response_time_ms INT DEFAULT 0;
    ALTER TABLE daily_answers ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'Medium';
    ALTER TABLE daily_answers ADD COLUMN IF NOT EXISTS topic TEXT DEFAULT 'General';
  `);

  // Persistent attempt log for comprehensive speed & accuracy analytics ("Monitor Me")
  await query(`
    CREATE TABLE IF NOT EXISTS answer_attempts (
      id SERIAL PRIMARY KEY,
      user_id INT REFERENCES users(id) ON DELETE CASCADE,
      question_id INT REFERENCES questions(id) ON DELETE CASCADE,
      track TEXT NOT NULL,
      chosen_answer INT NOT NULL,
      is_correct BOOLEAN NOT NULL,
      response_time_ms INT NOT NULL DEFAULT 0,
      difficulty TEXT NOT NULL DEFAULT 'Medium',
      topic TEXT NOT NULL DEFAULT 'General',
      attempt_date DATE DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS idx_attempts_user ON answer_attempts(user_id);
    CREATE INDEX IF NOT EXISTS idx_attempts_track ON answer_attempts(track);
    CREATE INDEX IF NOT EXISTS idx_attempts_date ON answer_attempts(attempt_date);
  `);

  await seedIfEmpty();
  await seedPosts();
}

async function seedIfEmpty() {
  const { rows } = await query('SELECT COUNT(*)::int AS count FROM questions');
  if (rows[0].count > 0) return;

  const questions = [
    { track: 'python', question_text: 'What is the difference between == and is in Python?', code_snippet: 'a = [1, 2, 3]\nb = [1, 2, 3]\nprint(a == b)\nprint(a is b)', options: ['No difference', '== checks equality, is checks identity', 'is checks equality, == checks identity', 'is is faster'], correct_index: 1, explanation: '== checks if the values are equal, while is checks if they are the same object in memory.' },
    { track: 'python', question_text: 'What will be the output of: len("hello")?', code_snippet: 'print(len("hello"))', options: ['4', '5', '6', 'Error'], correct_index: 1, explanation: 'The len() function returns the number of characters in a string. "hello" has 5 characters.' },
    { track: 'python', question_text: 'What is the output of list(range(3))?', code_snippet: 'print(list(range(3)))', options: ['[0, 1, 2, 3]', '[0, 1, 2]', '[1, 2, 3]', '[0, 3]'], correct_index: 1, explanation: 'range(3) generates numbers from 0 to 2 (not including 3). list() converts it to a list.' },
    { track: 'python', question_text: 'Which method removes and returns the last item from a list?', code_snippet: 'my_list = [1, 2, 3]\nmy_list.pop()', options: ['remove()', 'pop()', 'delete()', 'discard()'], correct_index: 1, explanation: 'The pop() method removes and returns the last item in the list. remove() only removes by value, not by index.' },
    { track: 'javascript', question_text: 'What is the output of console.log(typeof null)?', code_snippet: 'console.log(typeof null);', options: ['object', 'null', 'undefined', 'boolean'], correct_index: 0, explanation: 'Due to a quirk in JavaScript, typeof null returns "object". This is actually a bug in the JavaScript spec that couldn\'t be fixed due to backward compatibility.' },
    { track: 'javascript', question_text: 'What does console.log(0.1 + 0.2 === 0.3) output?', code_snippet: 'console.log(0.1 + 0.2 === 0.3);', options: ['true', 'false', 'undefined', 'NaN'], correct_index: 1, explanation: 'Due to floating-point precision issues, 0.1 + 0.2 is not exactly 0.3 in JavaScript. It outputs false.' },
    { track: 'javascript', question_text: 'What is the result of console.log([1,2,3].join("-"))?', code_snippet: 'console.log([1,2,3].join("-"));', options: ['1,2,3', '1-2-3', '[1-2-3]', 'undefined'], correct_index: 1, explanation: 'The join() method combines array elements into a string using the specified separator.' },
    { track: 'javascript', question_text: 'What is the output of typeof []?', code_snippet: 'console.log(typeof []);', options: ['array', 'object', 'list', 'undefined'], correct_index: 1, explanation: 'In JavaScript, arrays are objects. typeof [] returns "object".' },
    { track: 'node', question_text: 'Which core Node.js module is used for file system operations?', code_snippet: 'const fs = require("fs");', options: ['fs', 'file', 'io', 'system'], correct_index: 0, explanation: 'The fs module provides file system operations like reading and writing files.' },
    { track: 'node', question_text: 'What does require() return in Node.js?', code_snippet: 'const express = require("express");', options: ['a module object', 'a string', 'undefined', 'a function'], correct_index: 0, explanation: 'require() loads a module and returns the exported value from that module.' },
    { track: 'node', question_text: 'Which global object represents the current directory in Node.js?', code_snippet: 'console.log(__dirname);', options: ['__dirname', '__filename', 'process.cwd()', 'global.dir'], correct_index: 0, explanation: '__dirname is a global variable in Node.js that contains the absolute path of the current directory.' },
    { track: 'node', question_text: 'What is the purpose of package.json in Node.js?', code_snippet: 'cat package.json', options: ['defines project metadata and dependencies', 'stores user passwords', 'compiles TypeScript', 'runs tests only'], correct_index: 0, explanation: 'package.json is a manifest file that contains project metadata, dependencies, scripts, and other configuration.' },
  ];

  for (const q of questions) {
    await query(
      `INSERT INTO questions (track, question_text, code_snippet, options, correct_index, explanation)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [q.track, q.question_text, q.code_snippet, JSON.stringify(q.options), q.correct_index, q.explanation]
    );
  }

  const tips = [
    { track: 'javascript', tip_text: 'Use const by default, let when you need reassignment, and avoid var in modern JavaScript.' },
    { track: 'python', tip_text: 'Use list comprehensions to write more concise and readable Python code: [x*2 for x in range(10)]' },
    { track: 'node', tip_text: 'Use the fs.promises API instead of callback-based methods for cleaner async/await code in Node.js.' },
  ];

  for (const t of tips) {
    await query('INSERT INTO tips (track, tip_text) VALUES ($1, $2)', [t.track, t.tip_text]);
  }

}

const pythonListComprehensionsContent = `# Python List Comprehensions: A Beginner's Guide

List comprehensions are one of Python's most beloved and distinctive features. They allow you to transform and filter iterables into new lists using a single, readable line of code. By combining loops, conditions, and value expressions into a unified construct, list comprehensions replace tedious boilerplate with elegant, idiomatic Python.

## The Problem with Traditional Loops

Before list comprehensions, creating a modified list required initializing an empty container, constructing a standard for-loop, and repeatedly calling the append method on every iteration.

\`\`\`python
# Traditional approach
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squared_evens = []

for num in numbers:
    if num % 2 == 0:
        squared_evens.append(num ** 2)

print(squared_evens)
# Output: [4, 16, 36, 64, 100]
\`\`\`

While this code works reliably, it requires five lines of setup and mutates an empty list in-place. The actual intent of the loop—squaring the even numbers—is buried in structural overhead.

## Anatomy of a List Comprehension

A list comprehension conveys the exact same logic declaratively. The basic syntax follows a natural pattern enclosed in square brackets:

- Expression: The value to add to the new list, or an operation performed on each item.
- For clause: The iteration over the source iterable (for item in iterable).
- Condition (optional): A filter determining which elements qualify (if condition).

\`\`\`python
# The equivalent list comprehension
numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
squared_evens = [num ** 2 for num in numbers if num % 2 == 0]

print(squared_evens)
# Output: [4, 16, 36, 64, 100]
\`\`\`

## Transforming Data

You can apply functions, methods, or arbitrary mathematical operations inside the expression part of the comprehension.

\`\`\`python
# Cleaning raw string inputs
raw_names = ["   alice ", "BOB", "  chArlie  ", "Dave"]
clean_names = [name.strip().title() for name in raw_names]

print(clean_names)
# Output: ['Alice', 'Bob', 'Charlie', 'Dave']

# Converting temperature measurements
celsius_readings = [0.0, 15.5, 22.0, 30.5, 37.0]
fahrenheit_readings = [round((c * 9/5) + 32, 1) for c in celsius_readings]

print(fahrenheit_readings)
# Output: [32.0, 59.9, 71.6, 86.9, 98.6]
\`\`\`

## Conditional Filtering

Adding an if statement at the end of a list comprehension acts as a guard. Only elements that evaluate to truthy will pass through to the expression.

\`\`\`python
# Filtering records based on criteria
transactions = [
    {"user": "Alex", "amount": 120.0, "status": "completed"},
    {"user": "Beth", "amount": 45.0, "status": "pending"},
    {"user": "Charlie", "amount": 250.0, "status": "completed"},
    {"user": "Diana", "amount": 80.0, "status": "failed"},
]

valid_amounts = [t["amount"] for t in transactions if t["status"] == "completed"]

print(valid_amounts)
# Output: [120.0, 250.0]
\`\`\`

## Adding Else Clauses: The Ternary Expression

A common point of confusion for beginners is where to place an else condition. When you want to select between two alternative values rather than filtering elements out, place the ternary expression before the for clause.

\`\`\`python
# Syntax: [true_value if condition else false_value for item in iterable]
scores = [92, 45, 78, 59, 88, 30]
grades = ["Pass" if score >= 60 else "Fail" for score in scores]

print(grades)
# Output: ['Pass', 'Fail', 'Pass', 'Fail', 'Pass', 'Fail']
\`\`\`

## Flattening Nested Lists

List comprehensions can handle multiple for clauses, which is particularly useful for flattening matrices or two-dimensional collections into a single dimension.

\`\`\`python
# Flattening a 2D matrix
matrix = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
]

flattened = [cell for row in matrix for cell in row]

print(flattened)
# Output: [1, 2, 3, 4, 5, 6, 7, 8, 9]
\`\`\`

Keep in mind that the order of the for loops matches the order you would write them in traditional nested blocks: the outer loop comes first, followed by the inner loop.

## Performance and Bytecode Optimization

Beyond readability, list comprehensions are noticeably faster than standard for-loops using append.

- In a standard for-loop, Python must perform an attribute lookup (.append) on every iteration and execute a function call frame.
- In a list comprehension, CPython optimizes the loop at the bytecode level, using the dedicated LIST_APPEND opcode in C without the Python-level method resolution overhead.
- In benchmarks across large lists, list comprehensions often run 25 to 35 percent faster than the equivalent loop using append.

## Best Practices and Anti-Patterns

While list comprehensions are powerful, writing idiomatic Python means knowing when not to use them.

- Prioritize readability: If your comprehension spans multiple lines, contains multiple nested loops, or requires complex ternary expressions, refactor it back into a standard for-loop.
- Avoid side effects: Never use a comprehension solely to trigger side effects (such as calling print or writing to a file). Use a standard loop when you are not building a list.
- Mind memory constraints: A list comprehension computes every element in memory immediately. If you are processing millions of items where you only need to iterate once, prefer generator expressions with parentheses to stream items lazily.`;

const nodeStreamsContent = `
# Node.js Streams: Processing Data Efficiently

When building robust server-side applications with Node.js, you'll inevitably face the challenge of handling large volumes of data. Reading a 5GB video file into memory using standard file system methods will instantly crash your application due to V8's memory limits. This is where **Streams** come to the rescue.

Streams are one of the most powerful—and often misunderstood—features of Node.js. They allow you to read and write data continuously, breaking massive payloads into small, manageable chunks.

## Why Use Streams?

Traditional data processing loads an entire file into memory before acting on it:

\`\`\`javascript
const fs = require('fs');
const http = require('http');

const server = http.createServer((req, res) => {
  // Bad: Loads the entire file into RAM before sending
  fs.readFile(__dirname + '/large-video.mp4', (err, data) => {
    res.end(data);
  });
});
\`\`\`

Using streams fundamentally shifts this model. Instead of loading the file at once, you pipe it piece-by-piece:

\`\`\`javascript
const server = http.createServer((req, res) => {
  // Good: Streams the file chunk-by-chunk to the client
  const stream = fs.createReadStream(__dirname + '/large-video.mp4');
  stream.pipe(res);
});
\`\`\`

With streams, your memory footprint stays practically zero, allowing your Node.js application to serve thousands of heavy requests concurrently without breaking a sweat.

## The Four Types of Streams

Node.js offers four fundamental stream types:

1. **Readable Streams:** Used for data reading operations (e.g., \`fs.createReadStream()\`, \`http.IncomingMessage\`).
2. **Writable Streams:** Used for data writing operations (e.g., \`fs.createWriteStream()\`, \`http.ServerResponse\`).
3. **Duplex Streams:** Streams that are both Readable and Writable (e.g., TCP sockets).
4. **Transform Streams:** A type of Duplex stream where the output is computed from the input (e.g., \`zlib.createGzip()\`).

## Mastering \`pipe()\` and \`pipeline()\`

The easiest way to consume streams is by connecting them together using \`pipe()\`. 

However, in modern Node.js development, it is highly recommended to use the \`stream.pipeline()\` utility instead of \`.pipe()\`. While \`.pipe()\` works perfectly for happy paths, it will leak memory if an error occurs in the middle of the stream chain, as the streams aren't automatically closed.

\`\`\`javascript
const { pipeline } = require('stream');
const fs = require('fs');
const zlib = require('zlib');

pipeline(
  fs.createReadStream('archive.tar'),
  zlib.createGzip(),
  fs.createWriteStream('archive.tar.gz'),
  (err) => {
    if (err) {
      console.error('Pipeline failed.', err);
    } else {
      console.log('Pipeline succeeded.');
    }
  }
);
\`\`\`

Using \`pipeline\` ensures that if the source stream emits an error, the destination and transform streams are properly destroyed, preventing memory leaks and hanging file descriptors.

## Asynchronous Iteration

With the advent of ES modules and modern JavaScript features, you can now consume Readable streams using standard asynchronous iterators (\`for await...of\`), making stream processing drastically easier to read:

\`\`\`javascript
const fs = require('fs');

async function processData() {
  const stream = fs.createReadStream('large-data.txt', { encoding: 'utf8' });
  
  for await (const chunk of stream) {
    console.log('Received chunk:', chunk.length);
    // Process your chunk natively without confusing event listeners
  }
}
\`\`\`

Streams are the engine driving high-performance I/O in Node.js. Mastering them is essential for any developer looking to build scalable, production-grade systems.
`;

const nodeExpressContent = `
# Building REST APIs with Express.js

Express.js has been the undisputed standard for building web servers and APIs in Node.js for over a decade. Its minimalist architecture, robust routing system, and vast middleware ecosystem make it the perfect tool for bootstrapping a REST API. 

In this comprehensive guide, we'll walk through designing and building scalable, maintainable REST APIs following modern best practices.

## Core Principles of REST

Before writing any code, it is vital to understand the constraints of REST (Representational State Transfer). A REST API should:
- Use standard HTTP methods correctly (\`GET\` for reading, \`POST\` for creating, \`PUT\`/\`PATCH\` for updating, \`DELETE\` for removal).
- Keep URLs strictly noun-based and pluralized (e.g., \`/users\` instead of \`/getUsers\`).
- Be completely stateless (each request contains all the information necessary to fulfill it; no server-side sessions).
- Return appropriate HTTP status codes (200, 201, 400, 401, 404, 500).

## Structuring an Express Application

As your application grows, tossing all your routes into an \`index.js\` file quickly becomes a maintenance nightmare. A standard scalable directory structure separates concerns:

\`\`\`text
src/
├── controllers/    # Request handling and response logic
├── routes/         # URL routing definitions
├── services/       # Core business logic and database interactions
├── middlewares/    # Custom Express middlewares (auth, validation, errors)
└── app.js          # Express app initialization
\`\`\`

## Creating a Robust Router

Using the \`express.Router()\` object allows you to build modular, mountable route handlers. 

\`\`\`javascript
// routes/users.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.get('/', userController.getAllUsers);
router.post('/', userController.createUser);
router.get('/:id', userController.getUserById);
router.delete('/:id', userController.deleteUser);

module.exports = router;
\`\`\`

In your main entry file, you simply mount this router to its root endpoint:

\`\`\`javascript
// app.js
const express = require('express');
const userRoutes = require('./routes/users');

const app = express();
app.use(express.json()); // Built-in body parsing middleware

app.use('/api/v1/users', userRoutes);
\`\`\`

## Global Error Handling Middleware

One of the most powerful features of Express is its centralized error-handling middleware. Instead of duplicating \`try/catch\` blocks that send custom error responses everywhere, you can pass errors down to a central handler using \`next(err)\`.

\`\`\`javascript
// middlewares/errorHandler.js
module.exports = (err, req, res, next) => {
  console.error(err.stack);
  
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(statusCode).json({
    status: 'error',
    statusCode,
    message
  });
};
\`\`\`

Attach this middleware to your app **after** all your route definitions:

\`\`\`javascript
app.use(require('./middlewares/errorHandler'));
\`\`\`

## Security and Best Practices

When deploying your API to production, routing isn't enough. You must secure it.
1. **Helmet:** Use the \`helmet\` package to automatically set secure HTTP headers.
2. **CORS:** Configure Cross-Origin Resource Sharing correctly to restrict which domains can access your API.
3. **Rate Limiting:** Protect your endpoints against brute-force and DDoS attacks using \`express-rate-limit\`.
4. **Validation:** Never trust client input. Use validation libraries like Joi or Zod to sanitize and validate incoming request bodies in your middleware chain.

Express gives you a blank canvas. By adopting modular architecture, standard HTTP practices, and centralizing error management, you can build APIs that scale seamlessly alongside your user base.
`;

const pythonGarbageCollectionContent = `# Understanding Python's Garbage Collection

Memory management in Python is fully automated. When you create variables, instantiate classes, or parse large datasets, the CPython runtime takes care of memory allocation and reclamation behind the scenes. However, writing high-performance, leak-free applications requires a clear understanding of Python's dual-layer garbage collection architecture: Reference Counting and the Generational Cyclic Garbage Collector.

## The Dual-Layer Architecture

CPython relies on two distinct systems working in tandem:

- Reference Counting: The primary, immediate memory management mechanism. Every object tracks how many references point to it. When that count drops to zero, the object is immediately destroyed.
- Cyclic Garbage Collector: The secondary safety net. It specifically detects and cleans up isolated reference cycles that reference counting cannot handle on its own.

## How Reference Counting Works

Every object in CPython contains standard metadata defined in the PyObject structure, including its type pointer and an integer field named ob_refcnt.

- When you assign an object to a new variable, pass it as a function argument, or add it to a container (like a list or dictionary), its reference count increments.
- When a variable goes out of scope, is reassigned, removed from a container, or explicitly deleted via the del keyword, its reference count decrements.
- As soon as the reference count reaches zero, Python instantly invokes the object's deallocator and returns the memory to the system or CPython's internal allocator (PyMalloc).

\`\`\`python
import sys

# Track reference counts using sys.getrefcount
# Note: getrefcount adds 1 temporary reference when invoked
item = [1, 2, 3]
print(sys.getrefcount(item))  # Output: 2 (variable + argument)

alias = item
print(sys.getrefcount(item))  # Output: 3

del alias
print(sys.getrefcount(item))  # Output: 2
\`\`\`

## The Critical Flaw: Reference Cycles

Reference counting has one fundamental limitation: it cannot resolve circular references. If Object A holds a reference to Object B, and Object B holds a reference to Object A, both reference counts remain at least 1, even if all external variables pointing to them are destroyed.

\`\`\`python
class Node:
    def __init__(self, name):
        self.name = name
        self.partner = None

# Create two nodes that refer to each other
node_a = Node("Alpha")
node_b = Node("Beta")
node_a.partner = node_b
node_b.partner = node_a

# Delete external variables
del node_a
del node_b

# At this point, the objects still exist in memory!
# node_a.partner keeps node_b alive, and node_b.partner keeps node_a alive.
\`\`\`

In a pure reference-counting system, these two objects would remain orphaned in RAM permanently, causing a classic memory leak.

## The Generational Garbage Collector

To solve circular references, CPython includes a cyclic garbage collector managed by the built-in gc module. The collector does not inspect atomic data like integers, strings, or floats, because they cannot hold references to other objects. Instead, it only tracks container objects such as lists, dictionaries, custom class instances, and tuples.

The collector organizes all tracked objects into three distinct generations:

- Generation 0 (Young): All newly instantiated container objects start here. This generation is inspected frequently.
- Generation 1 (Intermediate): Objects that survive a collection cycle in Generation 0 are promoted to Generation 1.
- Generation 2 (Old): Objects that survive collections in Generation 1 are promoted to Generation 2. These represent long-lived objects like singletons, modules, and persistent registries.

## The Collection Thresholds

CPython decides when to trigger a collection cycle using object allocation thresholds. You can inspect and configure these using the gc module.

\`\`\`python
import gc

# Inspect current collection thresholds (Gen0, Gen1, Gen2)
print(gc.get_threshold())
# Default output: (700, 10, 10)

# Inspect current collection counters
print(gc.get_count())
# Example output: (450, 4, 1)
\`\`\`

- When the net allocations (allocations minus deallocations) in Generation 0 exceed 700, a Generation 0 collection runs.
- Every 10 Generation 0 collections trigger a Generation 1 collection.
- Every 10 Generation 1 collections trigger a full Generation 2 collection.

## The Cycle Detection Algorithm

When a generational collection begins, Python executes a clever cycle-finding algorithm:

- For each candidate object in the generation, Python temporarily copies its reference count.
- The collector iterates through all referenced objects within the generation and decrements their copied counts.
- Any object whose copied count drops to zero was only kept alive by references originating from within the isolated cluster.
- These isolated clusters are classified as unreachable and safely reclaimed.

## Working with the GC Module

The gc module allows developers to inspect, tune, or manually control garbage collection behavior.

\`\`\`python
import gc

# Manually trigger a full garbage collection
unreachable_count = gc.collect()
print(f"Reclaimed {unreachable_count} unreachable cyclic objects.")

# Disable automatic collection (often used in latency-critical real-time paths)
gc.disable()

# Re-enable automatic collection
gc.enable()

# Check if collection is currently enabled
print(gc.isenabled())
\`\`\`

In high-throughput server environments, some teams (such as Instagram's web architecture team) famously disabled the generational garbage collector during pre-fork master processes to maximize shared memory through copy-on-write, reducing total RAM consumption.

## Practical Best Practices

To ensure smooth memory behavior in production Python systems:

- Break cycles explicitly: If you build graphs, doubly-linked structures, or tree hierarchies, set child and parent references to None when tearing down data structures.
- Use weak references: Utilize the weakref module for observer patterns and in-memory caches. A weak reference does not increment an object's reference count.
- Leverage context managers: Always use with statements for system resources (files, sockets, database transactions) to guarantee cleanup regardless of garbage collection timing.
- Profile memory proactively: Use tracemalloc to track memory allocations across code paths and identify lingering cyclic leaks before deploying to production.`;

async function seedPosts() {
  const posts = [
    {
      track: 'python',
      title: "Python List Comprehensions: A Beginner's Guide",
      slug: 'python-list-comprehensions',
      excerpt: 'List comprehensions provide a concise way to create lists. This guide covers the basics and best practices.',
      content: pythonListComprehensionsContent,
    },
    {
      track: 'python',
      title: "Understanding Python's Garbage Collection",
      slug: 'python-garbage-collection',
      excerpt: "Learn how Python manages memory and optimizes performance with automatic garbage collection.",
      content: pythonGarbageCollectionContent,
    },
    {
      track: 'javascript',
      title: 'Async/Await vs Promises in JavaScript',
      slug: 'async-await-vs-promises',
      excerpt: 'Explore the differences between async/await and promises, and when to use each approach.',
      content: 'Explore the differences between async/await and promises, and when to use each approach. While async/await is syntactic sugar over promises, it provides better readability and error handling.',
    },
    {
      track: 'javascript',
      title: 'JavaScript Closures Explained',
      slug: 'javascript-closures',
      excerpt: 'Understand how closures work in JavaScript and their practical applications in modern development.',
      content: 'Understand how closures work in JavaScript and their practical applications in modern development. Closures are fundamental to functional programming and are used everywhere in JavaScript.',
    },
    {
      track: 'node',
      title: 'Building REST APIs with Express.js',
      slug: 'express-rest-apis',
      excerpt: 'A comprehensive guide to building scalable REST APIs using Express.js and best practices.',
      content: nodeExpressContent,
    },
    {
      track: 'node',
      title: 'Node.js Streams: Processing Data Efficiently',
      slug: 'nodejs-streams',
      excerpt: 'Learn how to use Node.js streams for efficient data processing without loading entire files into memory.',
      content: nodeStreamsContent,
    },
  ];

  for (const p of posts) {
    await query(
      `INSERT INTO posts (track, title, slug, excerpt, content)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (slug) DO UPDATE SET
         track = EXCLUDED.track,
         title = EXCLUDED.title,
         excerpt = EXCLUDED.excerpt,
         content = EXCLUDED.content`,
      [p.track, p.title, p.slug, p.excerpt, p.content]
    );
  }
}

export default { query, ensureSchema };
