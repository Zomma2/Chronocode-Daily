import React, { useState } from 'react';

export default function ExplainFurtherButton({ className = '' }) {
  const [showTooltip, setShowTooltip] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        disabled
        aria-disabled="true"
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onFocus={() => setShowTooltip(true)}
        onBlur={() => setShowTooltip(false)}
        className="group relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-zinc-900/90 border border-zinc-700/60 text-zinc-400 hover:text-zinc-200 cursor-not-allowed transition-all duration-200 shadow-sm"
      >
        <svg className="w-3.5 h-3.5 text-indigo-400 animate-pulse" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
        </svg>
        <span className="text-zinc-300">Explain Further with AI</span>
        <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-semibold tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
          Coming Soon
        </span>
      </button>

      {/* Sleek Dark Tooltip */}
      {showTooltip && (
        <div
          role="tooltip"
          className="absolute bottom-full left-0 mb-2 z-30 w-72 p-3 rounded-lg bg-zinc-900 border border-zinc-700/80 shadow-2xl shadow-black/80 text-left animate-fade-in pointer-events-none"
        >
          <div className="flex items-center gap-1.5 text-xs font-semibold text-indigo-300 mb-1">
            <svg className="w-3 h-3 text-indigo-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L14.4 7.6L20 10L14.4 12.4L12 18L9.6 12.4L4 10L9.6 7.6L12 2Z" />
            </svg>
            <span>AI Code Assistant Preview</span>
          </div>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Dynamic AI-driven explanations, AST execution tracing, and edge-case interactive simulations will be available in an upcoming release!
          </p>
          <div className="absolute top-full left-6 -mt-px border-4 border-transparent border-t-zinc-700/80" />
        </div>
      )}
    </div>
  );
}
