export function parseMarkdown(markdown) {
  const lines = markdown.split('\n');
  const blocks = [];
  let currentBlock = [];
  let codeBlock = false;
  let codeLanguage = '';

  for (const line of lines) {
    if (line.startsWith('```')) {
      if (!codeBlock) {
        // Start code block
        if (currentBlock.length > 0) {
          blocks.push({ type: 'paragraph', content: currentBlock.join('\n').trim() });
          currentBlock = [];
        }
        codeBlock = true;
        codeLanguage = line.slice(3).trim() || '';
      } else {
        // End code block
        blocks.push({ type: 'code', language: codeLanguage, content: currentBlock.join('\n').trim() });
        currentBlock = [];
        codeBlock = false;
        codeLanguage = '';
      }
    } else if (codeBlock) {
      currentBlock.push(line);
    } else if (line.startsWith('# ')) {
      if (currentBlock.length > 0) {
        blocks.push({ type: 'paragraph', content: currentBlock.join('\n').trim() });
        currentBlock = [];
      }
      blocks.push({ type: 'h1', content: line.slice(2).trim() });
    } else if (line.startsWith('## ')) {
      if (currentBlock.length > 0) {
        blocks.push({ type: 'paragraph', content: currentBlock.join('\n').trim() });
        currentBlock = [];
      }
      blocks.push({ type: 'h2', content: line.slice(3).trim() });
    } else if (line.startsWith('- ')) {
      blocks.push({ type: 'li', content: line.slice(2).trim() });
    } else if (line.trim() === '') {
      if (currentBlock.length > 0 && currentBlock[currentBlock.length - 1] !== '') {
        currentBlock.push('');
      }
    } else {
      currentBlock.push(line);
    }
  }

  if (currentBlock.length > 0) {
    if (codeBlock) {
      blocks.push({ type: 'code', language: codeLanguage, content: currentBlock.join('\n').trim() });
    } else {
      blocks.push({ type: 'paragraph', content: currentBlock.join('\n').trim() });
    }
  }

  return blocks;
}

export function inlineMarkdown(text) {
  return text
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/_([^_]+)_/g, '<em>$1</em>');
}
