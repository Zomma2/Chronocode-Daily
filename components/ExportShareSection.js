import React, { useEffect, useRef, useState } from 'react';
import { EXPORT_STYLES } from '../lib/exportPng';

const STYLE_DETAILS = {
  dark: {
    name: 'Dark',
    desc: 'Default sleek zinc dark mode',
    swatchBg: '#09090b',
    swatchBorder: '#3f3f46',
  },
  nord: {
    name: 'Nord',
    desc: 'Cool arctic slate palette',
    swatchBg: '#2e3440',
    swatchBorder: '#4c566a',
  },
  vibrant: {
    name: 'Vibrant',
    desc: 'Deep navy with neon cyan & pink',
    swatchBg: 'linear-gradient(135deg, #0f172a 0%, #ff006e 50%, #00d9ff 100%)',
    swatchBorder: '#38bdf8',
  },
  minimal: {
    name: 'Minimal',
    desc: 'Clean paper white contrast',
    swatchBg: '#ffffff',
    swatchBorder: '#d4d4d8',
  },
  light: {
    name: 'Light',
    desc: 'Warm gray modern light theme',
    swatchBg: '#f4f4f5',
    swatchBorder: '#a1a1aa',
  },
};

export default function ExportShareSection({
  copyState,
  onCopyMarkdown,
  onDownloadFullQuestion,
  onDownloadCodeSnippet,
  hasCodeSnippet = true,
}) {
  const [openDropdown, setOpenDropdown] = useState(null); // 'full' | 'snippet' | null
  const containerRef = useRef(null);

  // Close dropdown on outside click or escape
  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenDropdown(null);
      }
    }

    function handleKeyDown(e) {
      if (e.key === 'Escape') {
        setOpenDropdown(null);
      }
    }

    if (openDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [openDropdown]);

  const toggleDropdown = (type) => {
    setOpenDropdown((prev) => (prev === type ? null : type));
  };

  const handleSelectFull = (styleKey) => {
    onDownloadFullQuestion(styleKey);
    setOpenDropdown(null);
  };

  const handleSelectSnippet = (styleKey) => {
    onDownloadCodeSnippet(styleKey);
    setOpenDropdown(null);
  };

  return (
    <div
      ref={containerRef}
      className="rounded-2xl border border-zinc-800/90 bg-gradient-to-b from-zinc-900/80 via-zinc-900/40 to-zinc-950/90 p-5 shadow-2xl backdrop-blur-md"
    >
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3.5 border-b border-zinc-800/70">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 shadow-sm">
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16 6 12 2 8 6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-semibold tracking-wide text-zinc-100">
              Export &amp; Share
            </h3>
            <p className="text-xs text-zinc-400">
              Save formatted text or generate high-resolution PNG snapshots
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 self-start sm:self-auto text-[11px] font-mono text-zinc-400 bg-zinc-900/90 border border-zinc-800 px-2 py-1 rounded-md">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>PNG &bull; Markdown</span>
        </div>
      </div>

      {/* Mobile backdrop for outside tap dismiss */}
      {openDropdown && (
        <div
          className="fixed inset-0 z-20 bg-black/50 backdrop-blur-[1px] sm:hidden"
          onClick={() => setOpenDropdown(null)}
        />
      )}

      {/* Grid of Action Cards */}
      <div
        className={`grid grid-cols-1 ${
          hasCodeSnippet ? 'sm:grid-cols-3' : 'sm:grid-cols-2'
        } gap-3`}
      >
        {/* Card 1: Copy as Markdown */}
        <button
          type="button"
          onClick={onCopyMarkdown}
          className={`group relative flex flex-col justify-between text-left p-4 rounded-xl border transition-all duration-200 ${
            copyState === 'copied'
              ? 'border-emerald-500/50 bg-emerald-950/20 shadow-lg shadow-emerald-950/30'
              : 'border-zinc-800/90 bg-zinc-950/60 hover:bg-zinc-900/70 hover:border-zinc-700/80 hover:-translate-y-0.5'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                  copyState === 'copied'
                    ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700'
                }`}
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
              <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                MD
              </span>
            </div>

            <div className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
              Copy as Markdown
            </div>
            <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
              Formatted question, choices, and explanation for notes or chat
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
            <span
              className={`text-xs font-medium transition-colors ${
                copyState === 'copied' ? 'text-emerald-400 font-semibold' : 'text-zinc-400 group-hover:text-zinc-200'
              }`}
            >
              {copyState === 'copied' ? 'Copied to Clipboard' : 'Copy Text'}
            </span>
            {copyState === 'copied' ? (
              <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5 text-zinc-500 group-hover:text-zinc-300 transition-transform group-hover:translate-x-0.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            )}
          </div>
        </button>

        {/* Card 2: Export Full Question */}
        <div className="relative flex flex-col">
          <button
            type="button"
            onClick={() => toggleDropdown('full')}
            className={`group h-full flex flex-col justify-between text-left p-4 rounded-xl border transition-all duration-200 ${
              openDropdown === 'full'
                ? 'border-emerald-500/60 bg-zinc-900/90 shadow-xl ring-2 ring-emerald-500/20'
                : 'border-zinc-800/90 bg-zinc-950/60 hover:bg-zinc-900/70 hover:border-zinc-700/80 hover:-translate-y-0.5'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                    openDropdown === 'full'
                      ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                      : 'bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700'
                  }`}
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <circle cx="8.5" cy="8.5" r="1.5" />
                    <polyline points="21 15 16 10 5 21" />
                  </svg>
                </div>
                <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                  PNG
                </span>
              </div>

              <div className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                Export Full Question
              </div>
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                Render a complete presentation card with code, options &amp; explanation
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-400 group-hover:text-emerald-300">
                Choose Theme
              </span>
              <svg
                className={`w-4 h-4 text-emerald-400 transition-transform duration-200 ${
                  openDropdown === 'full' ? 'rotate-180' : ''
                }`}
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </button>

          {/* Floating Theme Selector Dropup (opens to the top) */}
          {openDropdown === 'full' && (
            <div className="absolute left-0 right-0 bottom-[calc(100%+10px)] z-30 rounded-xl border border-zinc-700/80 bg-zinc-900 p-2 shadow-2xl animate-scale-in origin-bottom max-h-[340px] overflow-y-auto scrollbar-thin">
              <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 mb-1 flex items-center justify-between">
                <span>Select Style</span>
                <span className="font-mono text-[10px] text-zinc-500">5 themes</span>
              </div>
              <div className="space-y-1">
                {Object.entries(EXPORT_STYLES).map(([styleKey, styleInfo]) => {
                  const details = STYLE_DETAILS[styleKey] || {
                    desc: '',
                    swatchBg: '#27272a',
                    swatchBorder: '#52525b',
                  };
                  return (
                    <button
                      key={`full-${styleKey}`}
                      type="button"
                      onClick={() => handleSelectFull(styleKey)}
                      className="w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors hover:bg-zinc-800/80 group/item"
                    >
                      <div className="flex items-center gap-2.5">
                        <span
                          className="h-4 w-4 rounded-full shrink-0 shadow-inner"
                          style={{
                            background: details.swatchBg,
                            border: `1.5px solid ${details.swatchBorder}`,
                          }}
                        />
                        <div>
                          <div className="text-xs font-semibold text-zinc-200 group-hover/item:text-white flex items-center gap-1.5">
                            <span>{styleInfo.name}</span>
                            {styleKey === 'dark' && (
                              <span className="text-[9px] font-mono px-1 rounded bg-zinc-800 text-zinc-400">
                                Default
                              </span>
                            )}
                          </div>
                          <div className="text-[10px] text-zinc-400 leading-tight">
                            {details.desc}
                          </div>
                        </div>
                      </div>
                      <svg
                        className="w-3.5 h-3.5 text-zinc-500 group-hover/item:text-emerald-400 shrink-0 opacity-0 group-hover/item:opacity-100 transition-all"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Card 3: Export Code Snippet (if snippet exists) */}
        {hasCodeSnippet && (
          <div className="relative flex flex-col">
            <button
              type="button"
              onClick={() => toggleDropdown('snippet')}
              className={`group h-full flex flex-col justify-between text-left p-4 rounded-xl border transition-all duration-200 ${
                openDropdown === 'snippet'
                  ? 'border-indigo-500/60 bg-zinc-900/90 shadow-xl ring-2 ring-indigo-500/20'
                  : 'border-zinc-800/90 bg-zinc-950/60 hover:bg-zinc-900/70 hover:border-zinc-700/80 hover:-translate-y-0.5'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border transition-colors ${
                      openDropdown === 'snippet'
                        ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-400'
                        : 'bg-zinc-900 border-zinc-800 text-zinc-400 group-hover:text-zinc-200 group-hover:border-zinc-700'
                    }`}
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="16 18 22 12 16 6" />
                      <polyline points="8 6 2 12 8 18" />
                    </svg>
                  </div>
                  <span className="text-[10px] font-mono uppercase font-semibold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    PNG
                  </span>
                </div>

                <div className="text-sm font-semibold text-zinc-200 group-hover:text-white transition-colors">
                  Export Code Snippet
                </div>
                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                  Generate a syntax-highlighted code block card for social media or docs
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-300 group-hover:text-white">
                  Choose Theme
                </span>
                <svg
                  className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${
                    openDropdown === 'snippet' ? 'rotate-180 text-white' : ''
                  }`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </button>

            {/* Floating Theme Selector Dropup (opens to the top) */}
            {openDropdown === 'snippet' && (
              <div className="absolute left-0 right-0 bottom-[calc(100%+10px)] z-30 rounded-xl border border-zinc-700/80 bg-zinc-900 p-2 shadow-2xl animate-scale-in origin-bottom max-h-[340px] overflow-y-auto scrollbar-thin">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800/80 mb-1 flex items-center justify-between">
                  <span>Select Style</span>
                  <span className="font-mono text-[10px] text-zinc-500">5 themes</span>
                </div>
                <div className="space-y-1">
                  {Object.entries(EXPORT_STYLES).map(([styleKey, styleInfo]) => {
                    const details = STYLE_DETAILS[styleKey] || {
                      desc: '',
                      swatchBg: '#27272a',
                      swatchBorder: '#52525b',
                    };
                    return (
                      <button
                        key={`snippet-${styleKey}`}
                        type="button"
                        onClick={() => handleSelectSnippet(styleKey)}
                        className="w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors hover:bg-zinc-800/80 group/item"
                      >
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-4 w-4 rounded-full shrink-0 shadow-inner"
                            style={{
                              background: details.swatchBg,
                              border: `1.5px solid ${details.swatchBorder}`,
                            }}
                          />
                          <div>
                            <div className="text-xs font-semibold text-zinc-200 group-hover/item:text-white flex items-center gap-1.5">
                              <span>{styleInfo.name}</span>
                              {styleKey === 'dark' && (
                                <span className="text-[9px] font-mono px-1 rounded bg-zinc-800 text-zinc-400">
                                  Default
                                </span>
                              )}
                            </div>
                            <div className="text-[10px] text-zinc-400 leading-tight">
                              {details.desc}
                            </div>
                          </div>
                        </div>
                        <svg
                          className="w-3.5 h-3.5 text-zinc-500 group-hover/item:text-indigo-400 shrink-0 opacity-0 group-hover/item:opacity-100 transition-all"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

