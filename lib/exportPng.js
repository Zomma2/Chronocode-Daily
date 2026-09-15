// Export styles for code snippets
const EXPORT_STYLES = {
  dark: {
    name: 'Dark',
    bg: '#09090b',
    text: '#e4e4e7',
    headerBg: '#18181b',
    accentColor1: '#f87171',
    accentColor2: '#fbbf24',
    accentColor3: '#34d399',
    border: '#27272a',
    codeBlockBg: '#18181b',
    correctAnswer: '#10b981',
    correctAnswerBg: '#064e3b',
  },
  light: {
    name: 'Light',
    bg: '#f5f5f5',
    text: '#1f2937',
    headerBg: '#e5e7eb',
    accentColor1: '#ef4444',
    accentColor2: '#f59e0b',
    accentColor3: '#10b981',
    border: '#d1d5db',
    codeBlockBg: '#f3f4f6',
    correctAnswer: '#059669',
    correctAnswerBg: '#d1fae5',
  },
  minimal: {
    name: 'Minimal',
    bg: '#ffffff',
    text: '#1f2937',
    headerBg: 'transparent',
    accentColor1: 'transparent',
    accentColor2: 'transparent',
    accentColor3: 'transparent',
    border: '#e5e7eb',
    codeBlockBg: '#f9fafb',
    correctAnswer: '#047857',
    correctAnswerBg: '#ecfdf5',
  },
  vibrant: {
    name: 'Vibrant',
    bg: '#0f172a',
    text: '#e0f2fe',
    headerBg: '#1e293b',
    accentColor1: '#ff006e',
    accentColor2: '#00d9ff',
    accentColor3: '#ffbe0b',
    border: '#1e293b',
    codeBlockBg: '#1e293b',
    correctAnswer: '#06b6d4',
    correctAnswerBg: '#06478a',
  },
  nord: {
    name: 'Nord',
    bg: '#2e3440',
    text: '#eceff4',
    headerBg: '#3b4252',
    accentColor1: '#bf616a',
    accentColor2: '#ebcb8b',
    accentColor3: '#a3be8c',
    border: '#434c5e',
    codeBlockBg: '#3b4252',
    correctAnswer: '#8fbcbb',
    correctAnswerBg: '#2e3440',
  },
};

// Wrap text to fit within max width
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine + (currentLine ? ' ' : '') + word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });
  
  if (currentLine) lines.push(currentLine);
  return lines;
}

export function downloadCodeSnippetPng({ code, track, date, style = 'dark' }) {
  const theme = EXPORT_STYLES[style] || EXPORT_STYLES.dark;
  const paddingX = 32;
  const headerHeight = 56;
  const footerPadding = 24;
  const lineHeight = 22;
  const fontSize = 15;
  const font = `${fontSize}px "Fira Code", "SFMono-Regular", Consolas, monospace`;
  const lines = code.split('\n');

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  ctx.font = font;

  const textWidth = Math.max(...lines.map((line) => ctx.measureText(line).width));
  const width = Math.min(Math.max(textWidth + paddingX * 2, 480), 960);
  const height = headerHeight + lines.length * lineHeight + footerPadding;

  const scale = 2; // retina output
  canvas.width = width * scale;
  canvas.height = height * scale;
  ctx.scale(scale, scale);

  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, width, height);

  // Header
  if (theme.headerBg !== 'transparent') {
    ctx.fillStyle = theme.headerBg;
    ctx.fillRect(0, 0, width, headerHeight);
  }

  // Traffic light dots (if style supports them)
  if (theme.accentColor1 !== 'transparent') {
    [theme.accentColor1, theme.accentColor2, theme.accentColor3].forEach((color, i) => {
      ctx.beginPath();
      ctx.arc(24 + i * 20, 24, 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
    });
  }

  // Footer text
  ctx.fillStyle = theme.text;
  ctx.globalAlpha = 0.6;
  ctx.font = '13px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`Chronocode Daily · ${track} · ${date}`, width - 20, 28);
  ctx.globalAlpha = 1.0;
  ctx.textAlign = 'left';

  // Code
  ctx.font = font;
  ctx.fillStyle = theme.text;
  lines.forEach((line, i) => {
    ctx.fillText(line, paddingX, headerHeight + i * lineHeight + fontSize);
  });

  const link = document.createElement('a');
  link.download = `codebits-${track}-${date}-${style}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export function downloadFullQuestionPng({ question, options, correctIndex, explanation, track, date, style = 'dark' }) {
  const theme = EXPORT_STYLES[style] || EXPORT_STYLES.dark;
  
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');
  
  const paddingX = 40;
  const paddingY = 40;
  const lineHeight = 24;
  const sectionGap = 32;
  const maxWidth = 900;
  const contentWidth = maxWidth - paddingX * 2;
  
  // Title font
  ctx.font = 'bold 24px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  
  // Draw title/question
  const titleLines = wrapText(ctx, question, contentWidth);
  const titleHeight = titleLines.length * lineHeight + sectionGap;
  
  // Estimate total height needed
  const optionsHeight = (4 * lineHeight) + sectionGap;
  const explanationLines = [];
  
  ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  const wrappedExplanation = wrapText(ctx, explanation, contentWidth);
  const explanationHeight = wrappedExplanation.length * lineHeight + sectionGap + 40;
  
  const totalHeight = paddingY + titleHeight + optionsHeight + explanationHeight + paddingY;
  
  canvas.width = maxWidth * 2; // retina
  canvas.height = totalHeight * 2;
  ctx.scale(2, 2);
  
  // Background
  ctx.fillStyle = theme.bg;
  ctx.fillRect(0, 0, maxWidth, totalHeight);
  
  // Header bar
  if (theme.headerBg !== 'transparent') {
    ctx.fillStyle = theme.headerBg;
    ctx.fillRect(0, 0, maxWidth, 60);
    
    ctx.fillStyle = theme.text;
    ctx.font = '12px monospace';
    ctx.textAlign = 'right';
    ctx.globalAlpha = 0.7;
    ctx.fillText(`${track.toUpperCase()} • ${date}`, maxWidth - 20, 40);
    ctx.globalAlpha = 1.0;
    ctx.textAlign = 'left';
  }
  
  let currentY = paddingY + 60;
  
  // Question title
  ctx.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = theme.text;
  titleLines.forEach((line, i) => {
    ctx.fillText(line, paddingX, currentY + i * lineHeight);
  });
  currentY += titleHeight;
  
  // Options section
  ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = theme.text;
  ctx.globalAlpha = 0.7;
  ctx.fillText('Answers:', paddingX, currentY);
  currentY += lineHeight + 12;
  
  ctx.font = '14px monospace';
  options.forEach((option, index) => {
    const isCorrect = index === correctIndex;
    
    if (isCorrect) {
      // Highlight correct answer
      ctx.fillStyle = theme.correctAnswerBg;
      ctx.fillRect(paddingX - 8, currentY - 16, contentWidth + 16, 22);
      ctx.fillStyle = theme.correctAnswer;
      ctx.font = 'bold 14px monospace';
    } else {
      ctx.fillStyle = theme.text;
      ctx.globalAlpha = 0.8;
      ctx.font = '14px monospace';
    }
    
    const marker = ['A', 'B', 'C', 'D'][index];
    const checkmark = isCorrect ? ' (Correct)' : '';
    ctx.fillText(`${marker}. ${option}${checkmark}`, paddingX, currentY);
    
    ctx.globalAlpha = 1.0;
    currentY += lineHeight;
  });
  currentY += sectionGap;
  
  // Explanation section
  ctx.font = 'bold 14px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = theme.text;
  ctx.globalAlpha = 0.7;
  ctx.fillText('Explanation:', paddingX, currentY);
  currentY += lineHeight + 12;
  ctx.globalAlpha = 1.0;
  
  ctx.font = '13px -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';
  ctx.fillStyle = theme.text;
  wrappedExplanation.forEach((line, i) => {
    ctx.fillText(line, paddingX, currentY + i * lineHeight);
  });
  
  const link = document.createElement('a');
  link.download = `codebits-question-${track}-${date}-${style}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}

export { EXPORT_STYLES };
