export default function QuestionStatsWidget({ counts }) {
  if (!counts) return (
    <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-4 shadow-xl backdrop-blur-sm animate-pulse">
      <div className="h-4 bg-zinc-800 rounded w-1/2 mb-4"></div>
      <div className="space-y-3">
        <div className="h-3 bg-zinc-800 rounded w-full"></div>
        <div className="h-3 bg-zinc-800 rounded w-full"></div>
      </div>
    </div>
  );

  return (
    <div className="rounded-xl border border-zinc-800/90 bg-zinc-900/60 p-4 shadow-xl backdrop-blur-sm transition-all hover:border-emerald-900/50 hover:shadow-emerald-900/10">
      <div className="flex items-center gap-2 mb-3 pb-3 border-b border-zinc-800/50">
        <svg className="w-4 h-4 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Library Stats</h3>
      </div>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-blue-400" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
            </svg>
            <span className="text-sm text-zinc-300">Python</span>
          </div>
          <span className="text-sm font-mono text-emerald-400 bg-emerald-950/30 px-2.5 py-0.5 rounded border border-emerald-900/50 shadow-sm">{counts.python || 0}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-3.5 h-3.5 text-green-500" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11.9 2c-5.5 0-10 4.5-10 10s4.5 10 10 10 10-4.5 10-10S17.4 2 11.9 2zM12 20c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
              <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z"/>
            </svg>
            <span className="text-sm text-zinc-300">Node.js</span>
          </div>
          <span className="text-sm font-mono text-indigo-400 bg-indigo-950/30 px-2.5 py-0.5 rounded border border-indigo-900/50 shadow-sm">{counts.node || 0}</span>
        </div>
        <div className="pt-2 mt-2 border-t border-zinc-800/60 flex items-center justify-between">
          <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total Challenges</span>
          <span className="text-sm font-bold font-mono text-zinc-200 bg-zinc-800/80 px-2.5 py-0.5 rounded border border-zinc-700/50 shadow-sm">{counts.overall || 0}</span>
        </div>
      </div>
    </div>
  );
}
