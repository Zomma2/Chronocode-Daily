const KEYWORDS_PY = new Set([
  'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'in', 'import', 'from', 'as',
  'with', 'try', 'except', 'finally', 'raise', 'lambda', 'yield', 'None', 'True', 'False', 'and',
  'or', 'not', 'is', 'pass', 'break', 'continue', 'global', 'nonlocal', 'async', 'await', 'self',
]);

const KEYWORDS_JS = new Set([
  'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while', 'of', 'in', 'import',
  'from', 'export', 'default', 'class', 'extends', 'new', 'try', 'catch', 'finally', 'throw',
  'typeof', 'instanceof', 'async', 'await', 'yield', 'null', 'undefined', 'true', 'false',
  'switch', 'case', 'break', 'continue', 'this', 'super', 'require', 'module',
]);

// Order matters: comments/strings/numbers are matched before bare identifiers.
const TOKEN_REGEX =
  /(#[^\n]*)|(\/\/[^\n]*)|(\/\*[\s\S]*?\*\/)|("(?:[^"\\\n]|\\.)*"|'(?:[^'\\\n]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+\.?\d*\b)|([A-Za-z_$][\w$]*)/g;

export const TOKEN_CLASSES = {
  plain: 'text-zinc-300',
  keyword: 'text-fuchsia-400',
  string: 'text-amber-300',
  number: 'text-sky-400',
  comment: 'text-zinc-500 italic',
  function: 'text-emerald-400',
};

export function tokenizeCode(code, track) {
  const keywords = track === 'node' ? KEYWORDS_JS : KEYWORDS_PY;
  const tokens = [];
  let lastIndex = 0;
  let match;

  TOKEN_REGEX.lastIndex = 0;
  while ((match = TOKEN_REGEX.exec(code)) !== null) {
    if (match.index > lastIndex) {
      tokens.push({ text: code.slice(lastIndex, match.index), type: 'plain' });
    }

    const [full, comment1, comment2, comment3, str, num, ident] = match;
    if (comment1 || comment2 || comment3) {
      tokens.push({ text: full, type: 'comment' });
    } else if (str) {
      tokens.push({ text: full, type: 'string' });
    } else if (num) {
      tokens.push({ text: full, type: 'number' });
    } else if (ident) {
      const isCall = code[TOKEN_REGEX.lastIndex] === '(';
      if (keywords.has(ident)) {
        tokens.push({ text: full, type: 'keyword' });
      } else if (isCall) {
        tokens.push({ text: full, type: 'function' });
      } else {
        tokens.push({ text: full, type: 'plain' });
      }
    }

    lastIndex = TOKEN_REGEX.lastIndex;
  }

  if (lastIndex < code.length) {
    tokens.push({ text: code.slice(lastIndex), type: 'plain' });
  }

  return tokens;
}
