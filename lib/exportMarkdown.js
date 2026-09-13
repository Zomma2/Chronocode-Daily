export function buildMarkdown({ question, track, result }) {
  const lines = [];
  const label = track === 'node' ? 'Node.js' : 'Python';

  lines.push(`### Chronocode Daily — ${label} (${question.scheduled_date})`);
  lines.push('');
  lines.push(question.question_text);

  if (question.code_snippet) {
    lines.push('');
    lines.push('```' + (track === 'node' ? 'javascript' : 'python'));
    lines.push(question.code_snippet);
    lines.push('```');
  }

  lines.push('');
  question.options.forEach((opt, i) => {
    const marker = result && i === result.correct_index ? ' ✅' : '';
    lines.push(`- ${['A', 'B', 'C', 'D'][i]}. ${opt}${marker}`);
  });

  if (result) {
    lines.push('');
    lines.push(`**Explanation:** ${result.explanation}`);
  }

  return lines.join('\n');
}

export async function copyToClipboard(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) {
    await navigator.clipboard.writeText(text);
    return true;
  }
  return false;
}
