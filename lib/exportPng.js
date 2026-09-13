// Renders the code snippet onto a canvas and triggers a PNG download,
// so users get a shareable card without a server round-trip or image library.
export function downloadCodeSnippetPng({ code, track, date }) {
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

  ctx.fillStyle = '#09090b';
  ctx.fillRect(0, 0, width, height);

  ['#f87171', '#fbbf24', '#34d399'].forEach((color, i) => {
    ctx.beginPath();
    ctx.arc(24 + i * 20, 24, 6, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
  });

  ctx.fillStyle = '#71717a';
  ctx.font = '13px monospace';
  ctx.textAlign = 'right';
  ctx.fillText(`Chronocode Daily · ${track} · ${date}`, width - 20, 28);
  ctx.textAlign = 'left';

  ctx.font = font;
  ctx.fillStyle = '#e4e4e7';
  lines.forEach((line, i) => {
    ctx.fillText(line, paddingX, headerHeight + i * lineHeight + fontSize);
  });

  const link = document.createElement('a');
  link.download = `codebits-${track}-${date}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
