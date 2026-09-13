const path = require('path');
const fs = require('fs');
const Database = require('better-sqlite3');

const DATA_DIR = process.env.DATABASE_DIR || path.join(process.cwd(), 'data');
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'codebits.db');

fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');
db.exec(`
  CREATE TABLE IF NOT EXISTS questions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track TEXT NOT NULL,
    question_text TEXT NOT NULL,
    code_snippet TEXT,
    options TEXT NOT NULL,
    correct_index INTEGER NOT NULL,
    explanation TEXT NOT NULL,
    scheduled_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    track TEXT NOT NULL,
    tip_text TEXT NOT NULL,
    scheduled_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT NOT NULL,
    track TEXT NOT NULL,
    published_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_questions_track_date ON questions (track, scheduled_date);
  CREATE INDEX IF NOT EXISTS idx_tips_track_date ON tips (track, scheduled_date);
  CREATE INDEX IF NOT EXISTS idx_posts_track_published ON posts (track, published_at);
`);

function toDateString(d) {
  return d.toISOString().slice(0, 10);
}

const today = new Date();
today.setUTCHours(0, 0, 0, 0);

const pythonQuestions = [
  {
    question_text: 'What will be the output of the following dictionary comprehension?',
    code_snippet: 'my_dict = {x: x**2 for x in (1, 2, 1, 3)}\nprint(len(my_dict))',
    options: ['2', '3', '4', 'TypeError'],
    correct_index: 1,
    explanation:
      "Dictionary keys must be unique. The duplicate '1' overwrites the previous value, leaving 3 unique keys (1, 2, 3).",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'def add_item(item, items=[]):\n    items.append(item)\n    return items\n\nprint(add_item(1))\nprint(add_item(2))',
    options: ['[1] then [2]', '[1] then [1, 2]', '[2] then [2]', 'TypeError'],
    correct_index: 1,
    explanation:
      'Default mutable arguments are created once at function definition time and persist across calls, so the list accumulates items.',
  },
  {
    question_text: "What does Python's Global Interpreter Lock (GIL) primarily prevent?",
    code_snippet: null,
    options: [
      'Multiple native threads executing Python bytecode simultaneously',
      'Multiple processes running on the same machine',
      'Recursive function calls',
      'Import cycles between modules',
    ],
    correct_index: 0,
    explanation:
      "The GIL ensures only one thread executes Python bytecode at a time within a single process, which is why CPU-bound multithreading doesn't speed up pure Python code.",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'a = [1, 2, 3]\nb = [1, 2, 3]\nprint(a == b, a is b)',
    options: ['True True', 'True False', 'False True', 'False False'],
    correct_index: 1,
    explanation:
      '== compares values (equal lists), while is compares object identity; a and b are distinct list objects.',
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'def f(*args, **kwargs):\n    print(args, kwargs)\n\nf(1, 2, x=3)',
    options: ["(1, 2) {'x': 3}", "[1, 2] {'x': 3}", '(1, 2, 3) {}', 'TypeError'],
    correct_index: 0,
    explanation: '*args collects positional args into a tuple, **kwargs collects keyword args into a dict.',
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'def gen():\n    yield 1\n    yield 2\n\ng = gen()\nprint(list(g), list(g))',
    options: ['[1, 2] [1, 2]', '[1, 2] []', '[] [1, 2]', 'TypeError'],
    correct_index: 1,
    explanation: 'Generators are exhausted after one full iteration; the second list(g) call yields an empty list.',
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 's = "hello world"\nprint(s[::-1][:5])',
    options: ['hello', 'dlrow', 'world', 'olleh'],
    correct_index: 1,
    explanation:
      "Reversing gives 'dlrow olleh'; slicing the first 5 characters yields 'dlrow'.",
  },
  {
    question_text: 'What is the output order of the following code?',
    code_snippet:
      'def decorator(func):\n    def wrapper(*a, **k):\n        print("before")\n        result = func(*a, **k)\n        print("after")\n        return result\n    return wrapper\n\n@decorator\ndef greet():\n    print("hi")\n\ngreet()',
    options: ['hi, before, after', 'before, hi, after', 'before, after, hi', 'after, before, hi'],
    correct_index: 1,
    explanation: "The wrapper prints 'before', calls the original function which prints 'hi', then prints 'after'.",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'def f():\n    try:\n        return 1\n    finally:\n        print("cleanup")\n\nprint(f())',
    options: ['1 then cleanup', 'cleanup then 1', 'cleanup only', '1 only'],
    correct_index: 1,
    explanation:
      "'finally' always executes before the function actually returns, so 'cleanup' prints before the returned value is printed.",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'funcs = [lambda: i for i in range(3)]\nprint([f() for f in funcs])',
    options: ['[0, 1, 2]', '[2, 2, 2]', '[0, 0, 0]', 'TypeError'],
    correct_index: 1,
    explanation:
      "Lambdas capture the variable 'i' by reference, not its value at creation time; by the time they're called, the loop has finished and i is 2.",
  },
  {
    question_text: 'How many elements in the list below are truthy?',
    code_snippet: 'values = [0, "", None, [], {}, False, "0"]\nprint(sum(1 for v in values if v))',
    options: ['0', '1', '2', '7'],
    correct_index: 1,
    explanation:
      "Only the non-empty string '0' is truthy; all other listed values are falsy in Python.",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: "data = [(1, 'b'), (1, 'a'), (0, 'c')]\ndata.sort(key=lambda x: x[0])\nprint(data)",
    options: [
      "[(0, 'c'), (1, 'b'), (1, 'a')]",
      "[(0, 'c'), (1, 'a'), (1, 'b')]",
      "[(1, 'b'), (1, 'a'), (0, 'c')]",
      'TypeError',
    ],
    correct_index: 0,
    explanation:
      "Python's sort is stable, so elements with equal keys (both 1) keep their original relative order: ('b') before ('a').",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'a = 256\nb = 256\nc = 257\nd = 257\nprint(a is b, c is d)',
    options: ['True True', 'True False', 'False True', 'False False'],
    correct_index: 1,
    explanation:
      "CPython caches small integers (-5 to 256), so 'a is b' is True, but 257 falls outside that range so 'c is d' is typically False.",
  },
  {
    question_text: 'What is the output order of the following code?',
    code_snippet:
      'class Ctx:\n    def __enter__(self):\n        print("enter")\n        return self\n    def __exit__(self, *a):\n        print("exit")\n\nwith Ctx():\n    print("inside")',
    options: ['enter, inside, exit', 'inside, enter, exit', 'enter, exit, inside', 'exit, enter, inside'],
    correct_index: 0,
    explanation: '__enter__ runs first, then the with-block body, then __exit__ runs when the block completes.',
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'a = [1, 2, 3]\nb = a\nb.append(4)\nprint(a)',
    options: ['[1, 2, 3, 4]', '[1, 2, 3]', 'TypeError', 'None'],
    correct_index: 0,
    explanation: "In Python, lists are mutable. Assigning 'b = a' creates a reference to the same list object in memory, so modifying 'b' also affects 'a'.",
  },
  {
    question_text: 'What is the output of the following function calls?',
    code_snippet: 'def append_to(num, target=[]):\n    target.append(num)\n    return target\n\nprint(append_to(1))\nprint(append_to(2))',
    options: ['[1]\n[1, 2]', '[1]\n[2]', '[1]\n[1]', 'TypeError'],
    correct_index: 0,
    explanation: "Default mutable arguments are evaluated only once when the function is defined. The list 'target' is shared across all calls that do not provide an explicit argument.",
  },
  {
    question_text: 'What does the following code output?',
    code_snippet: 'print(type(lambda x: x))',
    options: ["<class 'function'>", "<class 'lambda'>", "<type 'callable'>", "<class 'method'>"],
    correct_index: 0,
    explanation: "A lambda function in Python is an anonymous function, and its built-in type is simply the 'function' class.",
  },
  {
    question_text: 'What is the result of evaluating this expression?',
    code_snippet: "print(bool('False'))",
    options: ['True', 'False', 'None', 'TypeError'],
    correct_index: 0,
    explanation: "Any non-empty string in Python evaluates to True when converted to a boolean, regardless of the text it contains.",
  },
  {
    question_text: 'What will be printed by this slice operation?',
    code_snippet: 'x = [1, 2, 3, 4, 5]\nprint(x[-2::-1])',
    options: ['[4, 3, 2, 1]', '[5, 4, 3, 2]', '[4, 5]', '[1, 2, 3, 4]'],
    correct_index: 0,
    explanation: 'The slice syntax is [start:stop:step]. Starting at index -2 (the number 4), stepping backward by 1 to the beginning of the list gives [4, 3, 2, 1].',
  },
  {
    question_text: 'What is the output of this set operation snippet?',
    code_snippet: 'a = {1, 2, 3}\nb = {3, 4, 5}\nprint(a ^ b)',
    options: ['{1, 2, 4, 5}', '{3}', '{1, 2, 3, 4, 5}', 'TypeError'],
    correct_index: 0,
    explanation: "The '^' operator on sets computes the symmetric difference, which returns elements that are in either set, but not in both.",
  },
  {
    question_text: 'What is the correct output when slicing out of bounds?',
    code_snippet: "text = 'python'\nprint(text[10:])",
    options: ["'' (empty string)", 'IndexError', 'None', "'python'"],
    correct_index: 0,
    explanation: 'Slicing a string out of bounds in Python does not raise an IndexError; it gracefully returns an empty string.',
  },
  {
    question_text: 'What happens when this tuple code is executed?',
    code_snippet: 't = (1, 2, [3, 4])\nt[2].append(5)\nprint(t)',
    options: ['(1, 2, [3, 4, 5])', 'TypeError', '(1, 2, [3, 4])', 'AttributeError'],
    correct_index: 0,
    explanation: "While tuples are immutable, mutable objects contained within them (like a list) can still be modified in place. The tuple's reference to the list object remains unchanged.",
  },
  {
    question_text: 'What is the output of this dictionary method?',
    code_snippet: "d = {'a': 1, 'b': 2}\nprint(d.get('c', 3))",
    options: ['3', 'None', 'KeyError', '2'],
    correct_index: 0,
    explanation: "The 'get' method returns the value for a key if it exists in the dictionary; otherwise, it returns the provided default value, which is 3 here.",
  },
  {
    question_text: 'What is printed by this list comprehension?',
    code_snippet: 'print([x for x in range(5) if x % 2 == 0])',
    options: ['[0, 2, 4]', '[2, 4]', '[1, 3]', '[0, 1, 2, 3, 4]'],
    correct_index: 0,
    explanation: "The list comprehension iterates from 0 to 4. The condition 'x % 2 == 0' filters for even numbers: 0, 2, and 4.",
  },
  {
    question_text: 'What does this isinstance check output?',
    code_snippet: 'print(isinstance(True, int))',
    options: ['True', 'False', 'TypeError', 'None'],
    correct_index: 0,
    explanation: "In Python, the boolean type ('bool') is a subclass of the integer type ('int'), so True is technically considered an instance of int.",
  },
  {
    question_text: 'What is the output of modifying this global variable?',
    code_snippet: 'x = 10\ndef foo():\n    global x\n    x += 5\nfoo()\nprint(x)',
    options: ['15', '10', 'UnboundLocalError', 'SyntaxError'],
    correct_index: 0,
    explanation: "The 'global' keyword allows the inner function to modify the variable 'x' from the global scope, changing its outer value to 15.",
  },
  {
    question_text: 'What is printed by the following string formatting code?',
    code_snippet: "print('{0:.2f}'.format(3.14159))",
    options: ['3.14', '3.14159', '3.142', '3.1'],
    correct_index: 0,
    explanation: "The format specifier '.2f' formats the floating-point number to exactly two decimal places, rounding appropriately.",
  },
  {
    question_text: 'What does the following equality check evaluate to?',
    code_snippet: 'print(1 == 1.0)',
    options: ['True', 'False', 'TypeError', 'None'],
    correct_index: 0,
    explanation: "The '==' operator checks for value equality. In Python, an integer and a float with the exact same numerical value are considered equal.",
  },
  {
    question_text: 'What is the output of summing a list of booleans?',
    code_snippet: 'print(sum([True, False, True]))',
    options: ['2', 'True', '3', 'TypeError'],
    correct_index: 0,
    explanation: "Since booleans are a subclass of integers (True equals 1, False equals 0), summing the list calculates 1 + 0 + 1, which equals 2.",
  },
  {
    question_text: 'What happens when you chain these string methods?',
    code_snippet: "x = 'hello'\nprint(x.upper().lower())",
    options: ['hello', 'HELLO', 'Hello', 'AttributeError'],
    correct_index: 0,
    explanation: "String methods can be chained sequentially. 'upper()' converts the string to 'HELLO', and then 'lower()' converts it right back to 'hello'.",
  },
  {
    question_text: 'What is the result of using the extend method?',
    code_snippet: 'nums = [1, 2, 3]\nnums.extend([4, 5])\nprint(len(nums))',
    options: ['5', '4', '3', 'TypeError'],
    correct_index: 0,
    explanation: "The 'extend' method iterates over the provided list and adds each element individually to the original list, changing its total length from 3 to 5.",
  },
  {
    question_text: 'What is the output of this identity comparison?',
    code_snippet: 'x = 5\ny = 5\nprint(x is y)',
    options: ['True', 'False', 'None', 'TypeError'],
    correct_index: 0,
    explanation: "In CPython, small integers (typically -5 to 256) are cached and reused, so both 'x' and 'y' point to the exact same object in memory.",
  },
  {
    question_text: 'What will be the data type returned by *args?',
    code_snippet: 'def func(*args):\n    return args\nprint(type(func(1, 2, 3)))',
    options: ["<class 'tuple'>", "<class 'list'>", "<class 'set'>", "<class 'dict'>"],
    correct_index: 0,
    explanation: "The '*args' syntax in a function definition packs all positional arguments passed to the function into a single tuple.",
  },
  {
    question_text: 'What is the result of the following math operation?',
    code_snippet: 'print(9 // 2)',
    options: ['4', '4.5', '5', '4.0'],
    correct_index: 0,
    explanation: "The '//' operator performs floor division, returning the largest integer less than or equal to the exact quotient. 9 divided by 2 is 4.5, which floors to 4.",
  },
  {
    question_text: "What is the output of the 'any' function in this code?",
    code_snippet: 'print(any([False, True, False]))',
    options: ['True', 'False', 'None', 'TypeError'],
    correct_index: 0,
    explanation: "The 'any()' function returns True if at least one element of the iterable is truthy. Since there is a 'True' in the list, it evaluates to True.",
  },
  {
    question_text: 'What does this dictionary comprehension produce?',
    code_snippet: 'd = {x: x**2 for x in (1, 2, 3)}\nprint(d[2])',
    options: ['4', '2', '8', 'KeyError'],
    correct_index: 0,
    explanation: "The dictionary comprehension creates a dictionary where the keys are 1, 2, and 3, and the values are their squares. Accessing key '2' returns 4.",
  },
  {
    question_text: 'What happens when you multiply a list by an integer?',
    code_snippet: 'print(type([1, 2] * 3))',
    options: ["<class 'list'>", "<class 'tuple'>", 'TypeError', 'SyntaxError'],
    correct_index: 0,
    explanation: 'Multiplying a list by an integer concatenates the list to itself that many times. The result remains a list.',
  },
  {
    question_text: 'What is printed by this logical evaluation?',
    code_snippet: 'print(True or (1 / 0))',
    options: ['True', 'ZeroDivisionError', 'False', 'None'],
    correct_index: 0,
    explanation: "Python uses short-circuit evaluation for the 'or' operator. Since the first operand is True, the entire expression evaluates to True without evaluating the division by zero.",
  },
  {
    question_text: "What is the result of zipping lists of unequal lengths?",
    code_snippet: "print(list(zip([1, 2], ['a', 'b', 'c'])))",
    options: ["[(1, 'a'), (2, 'b')]", "[(1, 'a'), (2, 'b'), (None, 'c')]", 'ValueError', "[(1, 'a')]"],
    correct_index: 0,
    explanation: "The 'zip()' function stops aggregating elements as soon as the shortest iterable is exhausted, ignoring the extra elements in the longer iterables.",
  },
  {
    question_text: 'What does this comparison evaluate to?',
    code_snippet: 'print(1 == True and 0 == False)',
    options: ['True', 'False', 'TypeError', 'None'],
    correct_index: 0,
    explanation: "In Python, booleans are a subclass of integers. 'True' evaluates to 1 and 'False' evaluates to 0, making both comparisons True.",
  },
  {
    question_text: 'What is the result of this function call with keyword arguments?',
    code_snippet: 'def func(x=1, y=2):\n    return x + y\nprint(func(y=3))',
    options: ['4', '3', '5', 'TypeError'],
    correct_index: 0,
    explanation: "The function call overrides the default value of 'y' with 3, but keeps the default value of 'x' as 1. The sum is 4.",
  },
  {
    question_text: "What happens when the 'find' method does not locate a substring?",
    code_snippet: "print('abc'.find('d'))",
    options: ['-1', 'ValueError', 'False', 'None'],
    correct_index: 0,
    explanation: "Unlike the 'index()' method which raises a ValueError, the 'find()' method safely returns -1 when the substring is not found.",
  },
  {
    question_text: 'What does the less-than operator do when used with sets?',
    code_snippet: 'print({1, 2} < {1, 2, 3})',
    options: ['True', 'False', 'TypeError', 'ValueError'],
    correct_index: 0,
    explanation: "When used with sets, the '<' operator checks for a proper subset relationship. Since {1, 2} is entirely contained within the larger set but not equal to it, the result is True.",
  },
  {
    question_text: 'What is the output of checking equality between these lists?',
    code_snippet: 'print([1, 2, 3] == [1, 2, 3])',
    options: ['True', 'False', 'TypeError', 'None'],
    correct_index: 0,
    explanation: "The '==' operator checks for value equality. Since both lists have the same elements in the exact same order, it returns True.",
  },
  {
    question_text: 'How many elements does this list have after the append operation?',
    code_snippet: 'x = [1, 2]\nx.append([3, 4])\nprint(len(x))',
    options: ['3', '4', '2', 'TypeError'],
    correct_index: 0,
    explanation: "The 'append()' method adds its argument as a single element to the end of the list. The list becomes [1, 2, [3, 4]], which has a length of 3.",
  },
  {
    question_text: 'How does Python evaluate this string comparison?',
    code_snippet: "print('a' < 'b')",
    options: ['True', 'False', 'TypeError', 'None'],
    correct_index: 0,
    explanation: "Strings are compared lexicographically using their Unicode code points. Since the ASCII/Unicode value of 'a' is less than 'b', it returns True.",
  },
  {
    question_text: 'What is the type returned by a function that lacks a return statement?',
    code_snippet: 'def my_func():\n    pass\nprint(type(my_func()))',
    options: ["<class 'NoneType'>", "<class 'function'>", "<class 'None'>", 'TypeError'],
    correct_index: 0,
    explanation: "If a Python function completes execution without encountering a return statement, it implicitly returns None, which is of type 'NoneType'.",
  },
  {
    question_text: 'What does this chained comparison evaluate to?',
    code_snippet: 'x = 5\nprint(1 < x < 10)',
    options: ['True', 'False', 'TypeError', 'SyntaxError'],
    correct_index: 0,
    explanation: "Python supports chained comparisons. The expression is evaluated as '(1 < x) and (x < 10)', which is True for x = 5.",
  },
  {
    question_text: 'What is the result of multiplying a string by zero?',
    code_snippet: "print('Hello' * 0)",
    options: ["'' (empty string)", 'None', 'TypeError', "'Hello'"],
    correct_index: 0,
    explanation: 'Multiplying a sequence (like a string or list) by 0 or a negative integer results in an empty sequence of the same type.',
  },
  {
    question_text: 'What happens when you assign an iterable to a list slice?',
    code_snippet: 'nums = [1, 2, 3]\nnums[1:2] = [4, 5]\nprint(nums)',
    options: ['[1, 4, 5, 3]', '[1, [4, 5], 3]', '[1, 4, 3]', 'TypeError'],
    correct_index: 0,
    explanation: "Assigning to a slice replaces that slice with the contents of the iterable. The single element '2' at index 1 is replaced by '4' and '5'.",
  },
  {
    question_text: 'What data type is created by this syntax?',
    code_snippet: 'a = (1,)\nprint(type(a))',
    options: ["<class 'tuple'>", "<class 'int'>", "<class 'list'>", 'SyntaxError'],
    correct_index: 0,
    explanation: "A single-element tuple must include a trailing comma. Without the comma, '(1)' would just be evaluated as an integer in parentheses.",
  },
  {
    question_text: 'What is the length of the dictionary after the update?',
    code_snippet: "d1 = {'a': 1}\nd2 = {'b': 2}\nd1.update(d2)\nprint(len(d1))",
    options: ['2', '1', '3', 'AttributeError'],
    correct_index: 0,
    explanation: "The 'update()' method adds the key-value pairs from d2 into d1. Since the keys are unique, d1 will now contain two items: {'a': 1, 'b': 2}.",
  },
  {
    question_text: 'What is printed by this exception handling block?',
    code_snippet: "try:\n    print(1 / 0)\nexcept ZeroDivisionError:\n    print('Zero')\nfinally:\n    print('End')",
    options: ["Zero\\nEnd", "End\\nZero", 'ZeroDivisionError', 'Zero'],
    correct_index: 0,
    explanation: "The division by zero triggers the except block, printing 'Zero'. The finally block is guaranteed to execute afterward, printing 'End'.",
  },
  {
    question_text: "What is the output of calling 'next()' on this generator?",
    code_snippet: 'def gen():\n    yield 1\n    yield 2\nprint(next(gen()))',
    options: ['1', '2', '[1, 2]', 'StopIteration'],
    correct_index: 0,
    explanation: "Calling 'gen()' creates a new generator object. The first call to 'next()' on this new generator runs it until the first yield statement, returning 1.",
  },
  {
    question_text: 'What does the following boolean conversion output?',
    code_snippet: 'print(bool([]))',
    options: ['False', 'True', 'None', 'TypeError'],
    correct_index: 0,
    explanation: 'In Python, empty collections such as lists, tuples, dictionaries, and sets are considered falsy, so converting them to a boolean evaluates to False.',
  },
  {
    question_text: 'What type of object is created by this comprehension?',
    code_snippet: 'print(type({x for x in range(3)}))',
    options: ["<class 'set'>", "<class 'dict'>", "<class 'list'>", "<class 'tuple'>"],
    correct_index: 0,
    explanation: "Using curly braces for a comprehension without key-value pairs (colons) generates a set comprehension, resulting in a set object.",
  },
  {
    question_text: 'What is the output of this f-string evaluation?',
    code_snippet: 'x = 10\nprint(f"{x + 1}")',
    options: ['11', '"11"', '10+1', 'TypeError'],
    correct_index: 0,
    explanation: 'Formatted string literals (f-strings) evaluate the expressions inside the curly braces at runtime and format the result as a string.',
  },
  {
    question_text: 'What does the dictionary pop method return in this scenario?',
    code_snippet: "d = {'a': 1}\nprint(d.pop('b', 2))",
    options: ['2', 'None', 'KeyError', '1'],
    correct_index: 0,
    explanation: "The 'pop()' method removes a key and returns its value. If the key is not found, it returns the provided default value (in this case, 2) without raising a KeyError.",
  },
  {
    question_text: 'What does the list look like after the insert operation?',
    code_snippet: 'nums = [1, 2]\nnums.insert(0, 0)\nprint(nums)',
    options: ['[0, 1, 2]', '[1, 2, 0]', '[0, 2]', 'TypeError'],
    correct_index: 0,
    explanation: "The 'insert(index, element)' method inserts an element at the specified index. Inserting at index 0 shifts the existing elements to the right.",
  },
  {
    question_text: 'What does this identity check evaluate to?',
    code_snippet: 'a = "hello"\nb = "hello"\nprint(a is b)',
    options: ['True', 'False', 'None', 'TypeError'],
    correct_index: 0,
    explanation: "Due to string interning in CPython, short strings that look like valid identifiers are often cached in memory, making 'a' and 'b' point to the exact same object.",
  },
  {
    question_text: 'What is the result of this map function call?',
    code_snippet: 'print(list(map(lambda x: x * 2, [1, 2])))',
    options: ['[2, 4]', '[1, 2, 1, 2]', '[1, 4]', 'TypeError'],
    correct_index: 0,
    explanation: "The 'map()' function applies the lambda function to every item in the iterable. Multiplying the integers by 2 results in [2, 4].",
  },
  {
    question_text: 'What is printed by this filter function call?',
    code_snippet: 'print(list(filter(lambda x: x > 1, [0, 1, 2, 3])))',
    options: ['[2, 3]', '[1, 2, 3]', '[0, 1]', '[True, True]'],
    correct_index: 0,
    explanation: "The 'filter()' function constructs an iterator from elements of the iterable for which the function returns true. Only 2 and 3 are strictly greater than 1.",
  },
  {
    question_text: 'What is the output of this chained exponentiation?',
    code_snippet: 'print(2 ** 3 ** 2)',
    options: ['512', '64', '512.0', 'TypeError'],
    correct_index: 0,
    explanation: "Exponentiation in Python is right-associative. The expression evaluates '3 ** 2' first (which is 9), and then '2 ** 9', resulting in 512.",
  },
  {
    question_text: 'What is the result of this bitwise OR operation?',
    code_snippet: 'print(5 | 2)',
    options: ['7', '5', '2', 'True'],
    correct_index: 0,
    explanation: "The bitwise OR operator '|' compares the binary representations (101 for 5 and 010 for 2). 101 | 010 evaluates to 111, which is 7 in decimal.",
  },
  {
    question_text: 'What element is accessed using this negative index?',
    code_snippet: 't = (10, 20, 30)\nprint(t[-1])',
    options: ['30', '10', '20', 'IndexError'],
    correct_index: 0,
    explanation: 'Negative indexing starts from the end of the sequence. The index -1 refers to the very last element of the tuple.',
  },
  {
    question_text: 'What does the list contain after the del statement?',
    code_snippet: 'l = [1, 2, 3]\ndel l[1]\nprint(l)',
    options: ['[1, 3]', '[2, 3]', '[1, 2]', 'TypeError'],
    correct_index: 0,
    explanation: "The 'del' statement removes the item at the specified index from the list in place. Index 1 corresponds to the element 2.",
  },
  {
    question_text: 'What is the output of accessing the class attribute through an instance?',
    code_snippet: 'class A:\n    x = 1\n\nA.x = 2\nprint(A().x)',
    options: ['2', '1', 'AttributeError', 'None'],
    correct_index: 0,
    explanation: "When an instance does not have an instance attribute of a given name, Python looks it up on the class. Changing the class attribute 'x' affects all instances.",
  },
  {
    question_text: 'What happens when you return an integer from an __init__ method?',
    code_snippet: 'class B:\n    def __init__(self):\n        return 1\n\nb = B()',
    options: ['TypeError', '1', 'None', 'AttributeError'],
    correct_index: 0,
    explanation: "The '__init__' method is strictly meant for initializing a newly created object and must return None. Returning anything else raises a TypeError.",
  },
  {
    question_text: 'What is the result of this split operation with maxsplit?',
    code_snippet: "print('a,b,c'.split(',', 1))",
    options: ["['a', 'b,c']", "['a', 'b', 'c']", "['a,b', 'c']", 'ValueError'],
    correct_index: 0,
    explanation: "The second argument to 'split()' is 'maxsplit'. Setting it to 1 limits the split to a single occurrence, leaving the rest of the string intact in the final list element.",
  },
  {
    question_text: 'What is the output of this join operation?',
    code_snippet: "print('-'.join(['a', 'b']))",
    options: ['a-b', "['a-b']", "['a', '-', 'b']", 'TypeError'],
    correct_index: 0,
    explanation: "The 'join()' method is called on a separator string and takes an iterable of strings, concatenating them together with the separator in between.",
  },
  {
    question_text: 'What does accessing a missing key in a defaultdict output?',
    code_snippet: "import collections\nd = collections.defaultdict(int)\nprint(d['missing'])",
    options: ['0', 'None', 'KeyError', 'TypeError'],
    correct_index: 0,
    explanation: "A 'defaultdict' calls its default factory (in this case, 'int') to supply a value for missing keys. Calling 'int()' without arguments returns 0.",
  },
  {
    question_text: "What is the first element returned by this enumerate call?",
    code_snippet: "print(list(enumerate(['a', 'b'], start=1))[0])",
    options: ["(1, 'a')", "(0, 'a')", "('a', 1)", 'TypeError'],
    correct_index: 0,
    explanation: "The 'enumerate()' function yields pairs containing a count and a value. Passing 'start=1' changes the starting index from the default 0 to 1.",
  },
  {
    question_text: 'What data type is initialized by this syntax?',
    code_snippet: "print(type({'a'}))",
    options: ["<class 'set'>", "<class 'dict'>", "<class 'str'>", 'SyntaxError'],
    correct_index: 0,
    explanation: "Curly braces containing values without colons create a set literal. To create an empty set, you must use 'set()', as '{}' creates an empty dictionary.",
  },
  {
    question_text: 'What type is returned by the keys() method on a dictionary?',
    code_snippet: "d = {'a': 1}\nprint(type(d.keys()))",
    options: ["<class 'dict_keys'>", "<class 'list'>", "<class 'tuple'>", "<class 'generator'>"],
    correct_index: 0,
    explanation: "In Python 3, 'dict.keys()' returns a view object of type 'dict_keys', not a list. It provides a dynamic view of the dictionary's entries.",
  },  {
    question_text: "What is the output of the 'all' function in this code?",
    code_snippet: "print(all([True, True, False]))",
    options: ["False", "True", "None", "TypeError"],
    correct_index: 0,
    explanation: "The 'all()' function returns True only if every element in the iterable is truthy. Since there is a 'False' in the list, it evaluates to False.",
  },
  {
    question_text: "What does this identity check between two identical lists evaluate to?",
    code_snippet: "a = [1, 2, 3]\nb = [1, 2, 3]\nprint(a is b)",
    options: ["False", "True", "None", "TypeError"],
    correct_index: 0,
    explanation: "Even though the lists have the exact same values, they are two distinct objects in memory. The 'is' operator checks for object identity, not value equality.",
  },
  {
    question_text: "What is the resulting list from this list comprehension containing an if-else expression?",
    code_snippet: "print([x if x % 2 == 0 else 0 for x in range(3)])",
    options: ["[0, 0, 2]", "[0, 1, 2]", "[0, 2]", "SyntaxError"],
    correct_index: 0,
    explanation: "The comprehension iterates over 0, 1, and 2. It keeps the number if it is even, and replaces it with 0 if it is odd. This results in [0, 0, 2].",
  },
  {
    question_text: "What does printing the string after using the replace method output?",
    code_snippet: "s = \"cat\"\ns.replace(\"c\", \"b\")\nprint(s)",
    options: ["cat", "bat", "None", "AttributeError"],
    correct_index: 0,
    explanation: "Strings in Python are immutable. The 'replace()' method returns a new string but does not modify the original string 's' in place.",
  },
  {
    question_text: "What is the result of this modulo operation involving a negative number?",
    code_snippet: "print(-5 % 3)",
    options: ["1", "-2", "2", "-1"],
    correct_index: 0,
    explanation: "In Python, the modulo operator '%' always yields a result with the same sign as the divisor. -5 divided by 3 is -2 with a remainder of 1 (since -2 * 3 + 1 = -5).",
  },
  {
    question_text: "What is the length of this dictionary?",
    code_snippet: "d = {1: 'a', True: 'b'}\nprint(len(d))",
    options: ["1", "2", "3", "TypeError"],
    correct_index: 0,
    explanation: "In Python dictionaries, keys are evaluated by equality. Since 1 == True and they share the same hash, the second key 'True' overwrites the value for the key '1'.",
  },
  {
    question_text: "What happens when you try to add a list to a set?",
    code_snippet: "s = {1, 2}\ns.add([3, 4])\nprint(s)",
    options: ["TypeError", "{1, 2, [3, 4]}", "{1, 2, 3, 4}", "AttributeError"],
    correct_index: 0,
    explanation: "Sets can only contain hashable (immutable) elements. A list is mutable and unhashable, so attempting to add it to a set raises a TypeError.",
  },
  {
    question_text: "What does calling 'list()' on a generator expression after calling 'next()' produce?",
    code_snippet: "g = (x for x in range(3))\nnext(g)\nprint(list(g))",
    options: ["[1, 2]", "[0, 1, 2]", "[2]", "StopIteration"],
    correct_index: 0,
    explanation: "The 'next(g)' call consumes the first item (0) from the generator. Passing the generator to 'list()' consumes and collects the remaining items (1 and 2).",
  },
  {
    question_text: "What does this built-in class inspection function return?",
    code_snippet: "print(issubclass(bool, int))",
    options: ["True", "False", "None", "TypeError"],
    correct_index: 0,
    explanation: "The boolean type ('bool') is implemented as a subclass of the integer type ('int') in Python, which is why True acts like 1 and False acts like 0 in arithmetic.",
  },
  {
    question_text: "What is assigned to the variable 'b' through iterable unpacking?",
    code_snippet: "a, *b, c = [1, 2, 3, 4]\nprint(b)",
    options: ["[2, 3]", "2", "[2, 3, 4]", "TypeError"],
    correct_index: 0,
    explanation: "The starred expression '*b' absorbs any number of elements that are not assigned to the mandatory variables. 'a' gets 1, 'c' gets 4, and 'b' gets a list of the rest: [2, 3].",
  },
  {
    question_text: "What does the eval function return for this mathematical string?",
    code_snippet: "print(eval(\"1 + 2 * 3\"))",
    options: ["7", "9", "\"1 + 2 * 3\"", "TypeError"],
    correct_index: 0,
    explanation: "The 'eval()' function parses the string argument as a Python expression and executes it. Standard order of operations applies (multiplication before addition).",
  },
  {
    question_text: "What is the output of rounding these floating-point numbers?",
    code_snippet: "print(round(2.5), round(3.5))",
    options: ["2 4", "3 4", "2 3", "3 3"],
    correct_index: 0,
    explanation: "Python's built-in 'round()' uses 'Banker's Rounding', which rounds exact half-values (.5) to the nearest even integer to minimize cumulative rounding errors.",
  },
  {
    question_text: "What is the value associated with the key 'a' after calling setdefault?",
    code_snippet: "d = {'a': 1}\nd.setdefault('a', 2)\nprint(d['a'])",
    options: ["1", "2", "None", "KeyError"],
    correct_index: 0,
    explanation: "The 'setdefault()' method inserts a key with a specified default value only if the key is not already present. Since 'a' exists, its original value remains unchanged.",
  },
  {
    question_text: "What is printed by accessing an attribute from a child class that does not define it?",
    code_snippet: "class A:\n    x = 1\nclass B(A):\n    pass\nprint(B.x)",
    options: ["1", "None", "AttributeError", "NameError"],
    correct_index: 0,
    explanation: "If a class attribute is not found on the child class, Python's attribute lookup searches the base classes in its Method Resolution Order (MRO), finding 'x' on class A.",
  },
  {
    question_text: "What is the result of using the 'type' function on 'type' itself?",
    code_snippet: "print(type(type(1)))",
    options: ["<class 'type'>", "<class 'int'>", "<class 'object'>", "TypeError"],
    correct_index: 0,
    explanation: "The expression 'type(1)' returns the class 'int'. Calling 'type()' again on the 'int' class returns 'type', because all classes are instances of the metaclass 'type'.",
  },
  {
    question_text: "What does this chained boolean expression evaluate to?",
    code_snippet: "print(not 0 and \"a\" or \"b\")",
    options: ["a", "b", "True", "False"],
    correct_index: 0,
    explanation: "Python evaluates 'not 0' as True. 'True and \"a\"' evaluates to \"a\". Since \"a\" is truthy, the 'or' operator short-circuits and returns \"a\".",
  },
  {
    question_text: "What is the output of the divmod function?",
    code_snippet: "print(divmod(10, 3))",
    options: ["(3, 1)", "[3, 1]", "3.333", "TypeError"],
    correct_index: 0,
    explanation: "The 'divmod(a, b)' function takes two numbers and returns a tuple consisting of their quotient and remainder: (a // b, a % b).",
  },
  {
    question_text: "What is the result of stripping specific characters from a string?",
    code_snippet: "print(\"abcba\".strip(\"a\"))",
    options: ["bcb", "bcba", "abcb", "abcba"],
    correct_index: 0,
    explanation: "The 'strip()' method removes any characters passed in the argument string from both the leading and trailing ends of the main string. It stops at the first non-matching character.",
  },
  {
    question_text: "What occurs when calling a function that references a variable before assigning to it locally?",
    code_snippet: "x = 1\ndef f():\n    print(x)\n    x = 2\nf()",
    options: ["UnboundLocalError", "1", "2", "NameError"],
    correct_index: 0,
    explanation: "Because 'x' is assigned a value anywhere within the function body, Python treats it as a local variable entirely. Using it in 'print(x)' before the assignment causes an UnboundLocalError.",
  },
  {
    question_text: "What does this set difference operation return?",
    code_snippet: "a = {1, 2, 3}\nb = {3, 4, 5}\nprint(a - b)",
    options: ["{1, 2}", "{4, 5}", "{1, 2, 4, 5}", "TypeError"],
    correct_index: 0,
    explanation: "The subtraction operator '-' between two sets computes the set difference, keeping only the elements that exist in the left set ('a') but not in the right set ('b').",
  },
  {
    question_text: "What does modifying a shallow copy do to nested lists?",
    code_snippet: "import copy\na = [1, [2, 3]]\nb = copy.copy(a)\nb[1].append(4)\nprint(a)",
    options: ["[1, [2, 3, 4]]", "[1, [2, 3]]", "[1, [2, 3], 4]", "TypeError"],
    correct_index: 0,
    explanation: "A shallow copy creates a new list, but inserts references to the nested objects. Modifying a mutable nested object in the copy also affects the original list.",
  },
  {
    question_text: "What does the function return?",
    code_snippet: "def func():\n    try:\n        return 1\n    finally:\n        return 2\nprint(func())",
    options: ["2", "1", "None", "SyntaxError"],
    correct_index: 0,
    explanation: "The 'finally' block always executes before the function exits. If both 'try' and 'finally' blocks contain 'return' statements, the one in 'finally' overrides the other.",
  },
  {
    question_text: "What is the output of unpacking this dictionary into a function?",
    code_snippet: "def func(a, b):\n    return a + b\nd = {'a': 1, 'b': 2}\nprint(func(**d))",
    options: ["3", "TypeError", "12", "None"],
    correct_index: 0,
    explanation: "The '**' operator unpacks a dictionary into keyword arguments. The keys match the function parameters, so 'a=1' and 'b=2' are passed.",
  },
  {
    question_text: "What is the result of using a negative step in a slice missing start and stop bounds?",
    code_snippet: "l = [1, 2, 3, 4]\nprint(l[::-1])",
    options: ["[4, 3, 2, 1]", "[]", "[1, 2, 3, 4]", "TypeError"],
    correct_index: 0,
    explanation: "Omitting the start and stop indices while providing a step of -1 creates a shallow copy of the list in reverse order.",
  },
  {
    question_text: "What happens when you multiply a list by a negative integer?",
    code_snippet: "print([1, 2] * -1)",
    options: ["[]", "[-1, -2]", "[2, 1]", "TypeError"],
    correct_index: 0,
    explanation: "Multiplying a sequence by a negative integer is treated the same as multiplying by 0, returning an empty sequence of the same type.",
  },
  {
    question_text: "What does the 'yield from' statement do here?",
    code_snippet: "def gen1():\n    yield 1\n    yield 2\ndef gen2():\n    yield from gen1()\n    yield 3\nprint(list(gen2()))",
    options: ["[1, 2, 3]", "[<generator object>, 3]", "[1, 3]", "TypeError"],
    correct_index: 0,
    explanation: "'yield from' delegates the generation to a subgenerator, yielding all of its values sequentially before continuing execution.",
  },
  {
    question_text: "What does the dictionary 'setdefault' method return if the key already exists?",
    code_snippet: "d = {'x': 10}\nprint(d.setdefault('x', 20))",
    options: ["10", "20", "None", "KeyError"],
    correct_index: 0,
    explanation: "The 'setdefault' method returns the value of the key if it exists in the dictionary, ignoring the provided default argument.",
  },
  {
    question_text: "What is the output of this multiple inheritance class structure?",
    code_snippet: "class A:\n    def do(self): return 'A'\nclass B(A):\n    pass\nclass C(A):\n    def do(self): return 'C'\nclass D(B, C):\n    pass\nprint(D().do())",
    options: ["C", "A", "TypeError", "AttributeError"],
    correct_index: 0,
    explanation: "Python uses C3 linearization to determine the Method Resolution Order (MRO). D inherits from B and C. B does not have 'do', so it checks C before falling back to A.",
  },
  {
    question_text: "What does evaluating this chained combination of 'and' and 'or' yield?",
    code_snippet: "print(0 or 1 and 2)",
    options: ["2", "1", "0", "True"],
    correct_index: 0,
    explanation: "The 'and' operator has higher precedence than 'or'. '1 and 2' evaluates to 2. Then, '0 or 2' evaluates to 2.",
  },
  {
    question_text: "What happens when passing mutable defaults that are modified across calls?",
    code_snippet: "def add(item, lst=[]):\n    lst.append(item)\n    return lst\nadd(1)\nprint(add(2, []))",
    options: ["[2]", "[1, 2]", "[1]", "TypeError"],
    correct_index: 0,
    explanation: "Although the default argument 'lst' retains state across calls, passing an explicit empty list '[]' in the second call overrides the default, returning just [2].",
  },
  {
    question_text: "What is the result of applying 'set()' to a string?",
    code_snippet: "s = 'aabbc'\nprint(sorted(set(s)))",
    options: ["['a', 'b', 'c']", "['a', 'a', 'b', 'b', 'c']", "{'a', 'b', 'c'}", "TypeError"],
    correct_index: 0,
    explanation: "Converting a string to a set creates a set of its unique characters. Wrapping it in 'sorted()' returns a sorted list of those characters.",
  },
  {
    question_text: "What is the length of this set?",
    code_snippet: "s = {1, 1.0, True}\nprint(len(s))",
    options: ["1", "3", "2", "TypeError"],
    correct_index: 0,
    explanation: "In Python, 1, 1.0, and True all evaluate as equal ('==') and share the same hash value. Therefore, the set only keeps the first one entered, resulting in a length of 1.",
  },
  {
    question_text: "What is the output of checking if a string is a subclass of another type?",
    code_snippet: "print(isinstance('Hello', (int, float, str)))",
    options: ["True", "False", "TypeError", "None"],
    correct_index: 0,
    explanation: "The 'isinstance()' function can accept a tuple of types. It returns True if the object is an instance of any of the types in the tuple.",
  },
  {
    question_text: "What is the value of x after executing this list comprehension?",
    code_snippet: "x = 5\n[x for x in range(3)]\nprint(x)",
    options: ["5", "2", "3", "None"],
    correct_index: 0,
    explanation: "In Python 3, list comprehensions have their own local scope. The loop variable 'x' does not leak out or overwrite the global variable 'x', so it remains 5.",
  },
  {
    question_text: "What does this zip_longest function return?",
    code_snippet: "from itertools import zip_longest\nprint(list(zip_longest('A', 'BC', fillvalue='-')))",
    options: ["[('A', 'B'), ('-', 'C')]", "[(None, 'A'), ('B', 'C')]", "[('A', 'B')]", "TypeError"],
    correct_index: 0,
    explanation: "'zip_longest' pairs elements until the longest iterable is exhausted, replacing missing values in shorter iterables with the specified 'fillvalue'.",
  },
  {
    question_text: "What is printed by this string formatting using dictionaries?",
    code_snippet: "d = {'name': 'Alice', 'age': 30}\nprint('{name} is {age}'.format(**d))",
    options: ["Alice is 30", "{name} is {age}", "KeyError", "TypeError"],
    correct_index: 0,
    explanation: "Unpacking the dictionary using '**d' passes its key-value pairs as keyword arguments to the 'format()' method, successfully substituting them into the string.",
  },
  {
    question_text: "What is the output of the assignment expression (walrus operator)?",
    code_snippet: "if (n := len([1, 2, 3])) > 2:\n    print(n)",
    options: ["3", "True", "False", "SyntaxError"],
    correct_index: 0,
    explanation: "The walrus operator ':=' assigns the value (3) to 'n' and returns it for the evaluation. Since 3 > 2, it enters the block and prints 3.",
  },
  {
    question_text: "What is the result of using 'sum' on a nested list without a starting value?",
    code_snippet: "print(sum([[1, 2], [3, 4]], []))",
    options: ["[1, 2, 3, 4]", "10", "TypeError", "[[1, 2], [3, 4]]"],
    correct_index: 0,
    explanation: "The 'sum()' function takes an optional 'start' argument. By providing an empty list '[]', it repeatedly concatenates the nested lists, effectively flattening it.",
  },
  {
    question_text: "What does the bitwise XOR operator '^' output for identical integers?",
    code_snippet: "print(10 ^ 10)",
    options: ["0", "10", "1", "20"],
    correct_index: 0,
    explanation: "The XOR operator returns 1 for bits that are different and 0 for bits that are the same. Comparing a number to itself results in all 0s.",
  },
  {
    question_text: "What does the getattr function do with a default value?",
    code_snippet: "class Empty:\n    pass\nprint(getattr(Empty(), 'attr', 'default'))",
    options: ["default", "None", "AttributeError", "TypeError"],
    correct_index: 0,
    explanation: "The 'getattr' function attempts to retrieve an attribute from an object. If the attribute does not exist and a default value is provided, it returns the default value instead of raising an AttributeError.",
  },];

const nodeQuestions = [
  {
    question_text: 'In what order will the following console logs execute?',
    code_snippet: "setTimeout(() => console.log('A'), 0);\nPromise.resolve().then(() => console.log('B'));\nconsole.log('C');",
    options: ['A, B, C', 'C, A, B', 'C, B, A', 'B, C, A'],
    correct_index: 2,
    explanation:
      "Synchronous code runs first ('C'). Then microtasks (Promises) run ('B'). Finally, macrotasks (setTimeout) run ('A').",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: "const obj = {\n  name: 'node',\n  greet() { return () => console.log(this.name); }\n};\nconst fn = obj.greet();\nfn();",
    options: ['node', 'undefined', 'TypeError', 'ReferenceError'],
    correct_index: 0,
    explanation: "Arrow functions capture 'this' lexically from the enclosing 'greet' method, so it still refers to 'obj'.",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'for (var i = 0; i < 3; i++) {\n  setTimeout(() => console.log(i), 0);\n}',
    options: ['0 1 2', '3 3 3', 'undefined undefined undefined', '0 0 0'],
    correct_index: 1,
    explanation: "'var' is function-scoped, so all three callbacks share the same 'i', which is 3 by the time they run.",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet:
      "Promise.all([\n  Promise.resolve(1),\n  Promise.reject('err'),\n  Promise.resolve(3)\n]).catch(e => console.log(e));",
    options: ['1', 'err', "[1, 'err', 3]", 'undefined'],
    correct_index: 1,
    explanation: 'Promise.all rejects as soon as any promise rejects, passing that rejection reason to .catch().',
  },
  {
    question_text: 'What does the second console.log print?',
    code_snippet:
      "// a.js\nlet count = 0;\nmodule.exports = { increment: () => ++count };\n\n// main.js\nconst a1 = require('./a');\nconst a2 = require('./a');\na1.increment();\nconsole.log(a2.increment());",
    options: ['1', '2', 'undefined', 'ReferenceError'],
    correct_index: 1,
    explanation:
      "Node caches modules after the first require, so a1 and a2 reference the same module instance and shared 'count' state.",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'const [a, b = 10] = [5];\nconsole.log(a, b);',
    options: ['5 undefined', '5 10', 'undefined 10', 'ReferenceError'],
    correct_index: 1,
    explanation: "Default values apply only when the destructured value is undefined; b takes its default of 10.",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'const obj = { a: 1, b: undefined, c: () => {} };\nconsole.log(JSON.stringify(obj));',
    options: ['{"a":1,"b":undefined}', '{"a":1}', '{"a":1,"c":null}', 'TypeError'],
    correct_index: 1,
    explanation: 'JSON.stringify omits object properties whose value is undefined or a function.',
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'const result = [1, 2, 3].reduce((acc, val) => acc + val);\nconsole.log(result);',
    options: ['6', "'123'", 'NaN', 'TypeError'],
    correct_index: 0,
    explanation:
      'Without an initial value, reduce uses the first element (1) as the accumulator and sums the rest, producing 6.',
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: "async function f() {\n  throw new Error('fail');\n}\nf().catch(e => console.log(e.message));",
    options: ['fail', 'undefined', 'Uncaught exception crashes process', 'TypeError'],
    correct_index: 0,
    explanation:
      'Throwing inside an async function rejects the returned promise, which .catch() handles by logging the error message.',
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: "function Animal() {}\nAnimal.prototype.speak = function() { return 'noise'; };\nconst a = new Animal();\nconsole.log(a.speak());",
    options: ['noise', 'undefined', 'TypeError: a.speak is not a function', 'ReferenceError'],
    correct_index: 0,
    explanation: "Instances created with 'new' inherit methods defined on the constructor's prototype.",
  },
  {
    question_text: 'Inside the readFile callback, what order do the two logs print in?',
    code_snippet:
      "const fs = require('fs');\nfs.readFile(__filename, () => {\n  setTimeout(() => console.log('timeout'), 0);\n  setImmediate(() => console.log('immediate'));\n});",
    options: ['timeout, immediate', 'immediate, timeout', 'order is not guaranteed', 'TypeError'],
    correct_index: 1,
    explanation:
      "Inside an I/O callback, the check phase (setImmediate) runs before the timers phase, so 'immediate' logs first.",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'const original = { a: 1, nested: { b: 2 } };\nconst copy = { ...original };\ncopy.nested.b = 99;\nconsole.log(original.nested.b);',
    options: ['2', '99', 'undefined', 'TypeError'],
    correct_index: 1,
    explanation: 'The spread operator performs a shallow copy, so nested objects are still shared by reference.',
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'const user = { profile: null };\nconsole.log(user.profile?.getName?.());',
    options: ['undefined', 'TypeError', 'null', 'ReferenceError'],
    correct_index: 0,
    explanation:
      "Optional chaining short-circuits and returns undefined when 'profile' is null, without attempting to call getName.",
  },
  {
    question_text: 'What is printed by the following code?',
    code_snippet: 'console.log(0.1 + 0.2 === 0.3);',
    options: ['true', 'false', 'TypeError', 'undefined'],
    correct_index: 1,
    explanation:
      'Floating-point arithmetic in IEEE 754 causes 0.1 + 0.2 to equal 0.30000000000000004, not exactly 0.3.',
  },
];

const pythonTips = [
  'Use dictionary comprehensions sparingly if the logic requires complex conditional branching, as it can severely impact readability.',
  'Avoid mutable default arguments (lists, dicts) in function signatures; use None and initialize inside the function body instead.',
  'Reach for multiprocessing or asyncio instead of threading when you need true CPU parallelism, since the GIL limits thread-based speedups.',
  "Prefer 'is' only for identity checks against singletons like None, True, and False; use '==' for value comparisons.",
  'Use **kwargs sparingly in public APIs; explicit named parameters are easier to discover and document.',
  'Generators are single-use iterators; convert to a list with list() only when you need to iterate more than once.',
  'Favor f-strings over % formatting or .format() for readability and slightly better performance.',
  "Use functools.wraps inside custom decorators to preserve the wrapped function's name and docstring.",
  "Wrap resource cleanup in 'finally' blocks or, better, use context managers ('with') so resources are always released.",
  'Avoid creating closures over loop variables directly; capture the current value with a default argument if you need per-iteration binding.',
  "Remember that empty containers, 0, and None are all falsy; be explicit with 'is None' checks when zero is a valid value.",
  "Python's sort() and sorted() are stable, so you can safely chain multiple sort passes to sort by multiple keys.",
  "Don't rely on small integer caching for identity comparisons; it's a CPython implementation detail, not a language guarantee.",
  'Prefer context managers over manual try/finally for anything that acquires a resource, like files, locks, or network connections.',
];

const nodeTips = [
  "Always prefer native Promises or async/await over raw callbacks to avoid the 'callback hell' pyramid of doom and keep the microtask queue predictable.",
  "Use arrow functions when you need to preserve the surrounding lexical 'this', such as inside object methods that create closures.",
  "Avoid 'var' in loops that schedule async callbacks; use 'let' so each iteration gets its own scoped binding.",
  'Use Promise.allSettled instead of Promise.all when you want all results even if some promises reject.',
  'Remember Node caches modules by resolved file path, so mutable state inside a module is shared across every require() of it.',
  'Provide default values in destructuring assignments to guard against undefined instead of littering code with manual checks.',
  'JSON.stringify silently drops undefined values and functions; validate your serialized output if those fields matter.',
  'Pass an explicit initial value to Array.prototype.reduce to avoid subtle bugs when the array might be empty.',
  "Wrap async function bodies in try/catch, or attach .catch() to the returned promise, so rejections don't become unhandled.",
  'Use Object.create or class syntax over manually wiring prototypes for clearer, more maintainable inheritance chains.',
  "setImmediate runs in the check phase after I/O callbacks, while setTimeout(fn, 0) runs in the next timers phase; don't assume they interleave predictably outside I/O callbacks.",
  'Use structuredClone() or a deep-clone utility when you need an independent copy of nested objects, not the spread operator.',
  'Optional chaining (?.) is great for safe navigation, but pair it with nullish coalescing (??) to supply sensible fallback values.',
  'Never compare floating-point numbers with ===; use a small epsilon tolerance (e.g., Math.abs(a-b) < 1e-9) instead.',
];

const insertQuestion = db.prepare(`
  INSERT INTO questions (track, question_text, code_snippet, options, correct_index, explanation, scheduled_date)
  VALUES (@track, @question_text, @code_snippet, @options, @correct_index, @explanation, @scheduled_date)
`);

const insertTip = db.prepare(`
  INSERT INTO tips (track, tip_text, scheduled_date)
  VALUES (@track, @tip_text, @scheduled_date)
`);

const seed = db.transaction(() => {
  db.exec('DELETE FROM questions; DELETE FROM tips;');

  pythonQuestions.forEach((q, i) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() + i);
    insertQuestion.run({
      track: 'python',
      question_text: q.question_text,
      code_snippet: q.code_snippet,
      options: JSON.stringify(q.options),
      correct_index: q.correct_index,
      explanation: q.explanation,
      scheduled_date: toDateString(date),
    });
  });

  nodeQuestions.forEach((q, i) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() + i);
    insertQuestion.run({
      track: 'node',
      question_text: q.question_text,
      code_snippet: q.code_snippet,
      options: JSON.stringify(q.options),
      correct_index: q.correct_index,
      explanation: q.explanation,
      scheduled_date: toDateString(date),
    });
  });

  pythonTips.forEach((tip_text, i) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() + i);
    insertTip.run({ track: 'python', tip_text, scheduled_date: toDateString(date) });
  });

  nodeTips.forEach((tip_text, i) => {
    const date = new Date(today);
    date.setUTCDate(date.getUTCDate() + i);
    insertTip.run({ track: 'node', tip_text, scheduled_date: toDateString(date) });
  });

  // Insert sample blog post
  const insertPost = db.prepare(`
    INSERT OR IGNORE INTO posts (slug, title, excerpt, content, track, published_at, updated_at)
    VALUES (@slug, @title, @excerpt, @content, @track, @published_at, @updated_at)
  `);

  insertPost.run({
    slug: 'python-generators-vs-comprehensions',
    title: 'Python Memory Architecture: Generators vs. Comprehensions',
    excerpt:
      'Learn the critical performance difference between eager and lazy evaluation when processing massive datasets.',
    content: `# Python Memory Architecture: Generators vs. Comprehensions

When processing massive datasets, the distinction between eager and lazy evaluation dictates whether your application scales gracefully or crashes due to memory exhaustion. While list comprehensions are celebrated for their readable syntax, they can become a critical bottleneck in memory-constrained environments like serverless functions or lightweight containers.

## The Eager Evaluation Bottleneck

A list comprehension computes the entire sequence and allocates memory for every element immediately upon execution.

- The syntax uses square brackets: \`data = [x**2 for x in range(1000000)]\`
- The Python interpreter requests a continuous block of memory from the operating system to store all one million integers simultaneously.
- If the dataset exceeds the available RAM, the operating system relies on swap space, heavily degrading application performance before eventually triggering an Out of Memory (OOM) kill signal.

## Lazy Evaluation with Generators

Generator expressions solve this memory bottleneck by yielding one item at a time. They do not store the computed sequence; they only store the instruction set required to compute the next value.

- The syntax uses parentheses: \`data = (x**2 for x in range(1000000))\`
- Instead of a populated list, this returns a generator object.
- The underlying values are only computed when explicitly requested via the \`next()\` function or consumed in a loop.
- The memory footprint remains near-constant, regardless of whether you are processing ten items or ten billion items.

## Memory Profiling in Practice

You can verify the architectural difference using Python's built-in \`sys\` module.

\`\`\`python
import sys

# Eager Allocation
list_comp = [x for x in range(1000000)]
print(sys.getsizeof(list_comp)) # Output: ~8448728 bytes (8.4 MB)

# Lazy Allocation
gen_expr = (x for x in range(1000000))
print(sys.getsizeof(gen_expr)) # Output: 104 bytes
\`\`\`

## Strategic Implementation

Choosing the correct structure depends entirely on downstream data utilization.

- Use list comprehensions when you must iterate over the data multiple times, or when you require immediate access to list methods like \`.sort()\` or \`len()\`.
- Use generator expressions when piping data directly into aggregate functions like \`sum()\`, \`max()\`, or when streaming large files line-by-line where holding the entire payload in memory is unnecessary.`,
    track: 'python',
    published_at: toDateString(today),
    updated_at: toDateString(today),
  });
});

seed();

console.log(`Seeded 14 days of questions and tips (python + node), starting ${toDateString(today)}.`);
db.close();
