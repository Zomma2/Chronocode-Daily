import React, { useState, useEffect, useRef } from 'react';
import LiveCodeRunner from './LiveCodeRunner';
import LiveJsRunner from './LiveJsRunner';
import { tokenizeCode, TOKEN_CLASSES } from '../lib/highlight';

export default function InteractiveRuntime({ track, initialCode }) {
  const [code, setCode] = useState(initialCode || '');
  const preRef = useRef(null);

  // Reset code when question changes
  useEffect(() => {
    setCode(initialCode || '');
  }, [initialCode]);

  // Sync scroll position so syntax highlighter stays aligned with textarea
  const handleScroll = (e) => {
    if (preRef.current) {
      preRef.current.scrollTop = e.target.scrollTop;
      preRef.current.scrollLeft = e.target.scrollLeft;
    }
  };

  // Prevent tab from changing focus, insert spaces instead
  const handleKeyDown = (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = e.target.selectionStart;
      const end = e.target.selectionEnd;
      const val = e.target.value;
      const newCode = val.substring(0, start) + '  ' + val.substring(end);
      setCode(newCode);
      // Wait for React state to update before moving cursor
      setTimeout(() => {
        e.target.selectionStart = e.target.selectionEnd = start + 2;
      }, 0);
    }
  };

  const tokens = tokenizeCode(code, track);
  
  // Shared styles between textarea and pre to guarantee perfect alignment
  const sharedClasses = "w-full min-h-[180px] font-mono text-[13px] leading-relaxed p-4 pt-10 m-0 border-none rounded-lg";

  return (
    <div className="mt-6 mb-8 p-5 bg-zinc-900/60 border border-zinc-800 rounded-xl">
      <p className="text-amber-500 font-medium mb-5 text-sm bg-amber-950/20 p-3 rounded-lg border border-amber-900/50 flex items-start gap-3">
        <svg className="w-5 h-5 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>
          For optimal learning, we recommend attempting to determine the output before executing the code. However, using the runtime as a verification tool is a completely valid approach.
        </span>
      </p>
      
      <div className="relative bg-black/80 border border-zinc-700/80 rounded-lg shadow-inner mb-4 focus-within:border-indigo-500/80 focus-within:ring-1 focus-within:ring-indigo-500/50 transition-all overflow-hidden group">
        
        {/* Track Label */}
        <div className="absolute top-0 right-0 z-20 px-3 py-1 bg-zinc-800/90 text-[11px] uppercase tracking-wider text-zinc-400 font-mono rounded-bl-lg border-b border-l border-zinc-700/80 backdrop-blur-sm">
          {track === 'python' ? 'Python' : 'Node.js'}
        </div>
        
        
        {/* Placeholder (since textarea text is transparent) */}
        {!code && (
          <div className={`absolute inset-0 pointer-events-none text-zinc-600 ${sharedClasses}`}>
            Enter your {track === 'python' ? 'Python' : 'JavaScript'} code here...
          </div>
        )}

        {/* Syntax Highlighted Backdrop */}
        <pre
          ref={preRef}
          aria-hidden="true"
          className={`absolute inset-0 pointer-events-none overflow-hidden whitespace-pre-wrap break-words ${sharedClasses}`}
        >
          <code className="block">
            {tokens.map((token, i) => (
              <span key={i} className={TOKEN_CLASSES[token.type]}>
                {token.text}
              </span>
            ))}
            {/* Important: pad with an extra newline if code ends with newline, else textarea scrolls past pre */}
            {code.endsWith('\n') ? <br /> : null}
          </code>
        </pre>

        {/* Editable Transparent Textarea */}
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onScroll={handleScroll}
          onKeyDown={handleKeyDown}
          className={`relative z-10 block bg-transparent text-transparent caret-zinc-100 outline-none resize-y overflow-auto whitespace-pre-wrap break-words ${sharedClasses}`}
          spellCheck={false}
        />
      </div>

      {track === 'python' ? (
        <LiveCodeRunner code={code} />
      ) : (
        <LiveJsRunner code={code} />
      )}
    </div>
  );
}
