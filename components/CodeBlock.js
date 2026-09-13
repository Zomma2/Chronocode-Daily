import React from 'react';
import { tokenizeCode, TOKEN_CLASSES } from '../lib/highlight';

export default function CodeBlock({ code, track, className = '' }) {
  const tokens = tokenizeCode(code, track);

  return (
    <div className={`bg-zinc-950 rounded-lg p-4 overflow-x-auto border border-zinc-800/50 ${className}`}>
      <pre className="font-mono text-[13px] leading-relaxed">
        <code>
          {tokens.map((token, i) => (
            <span key={i} className={TOKEN_CLASSES[token.type]}>
              {token.text}
            </span>
          ))}
        </code>
      </pre>
    </div>
  );
}
