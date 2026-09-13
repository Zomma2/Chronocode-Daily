import React, { useEffect, useState } from 'react';

function formatDate(dateStr) {
  const d = new Date(`${dateStr}T00:00:00Z`);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });
}

function TipSkeleton() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
      <div className="skeleton animate-shimmer h-3 w-16 rounded mb-3" />
      <div className="skeleton animate-shimmer h-3 w-full rounded mb-2" />
      <div className="skeleton animate-shimmer h-3 w-5/6 rounded" />
    </div>
  );
}

export default function TipsFeed() {
  const [tips, setTips] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    fetch('/api/tips-feed?track=python&limit=8')
      .then((res) => {
        if (!res.ok) throw new Error('Could not load tips feed');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setTips(data.tips);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="w-full lg:w-80 shrink-0 animate-slide-in-right">
      <div className="lg:sticky lg:top-24">
        <div className="flex items-center gap-2 mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <h2 className="text-sm font-bold tracking-wider text-zinc-300 uppercase">
            Python Tips &amp; Hacks
          </h2>
        </div>

        <div className="space-y-3 max-h-[32rem] overflow-y-auto scrollbar-thin pr-1">
          {!tips && !error && Array.from({ length: 4 }).map((_, i) => <TipSkeleton key={i} />)}

          {error && (
            <div className="text-sm text-rose-400 border border-rose-900/50 bg-rose-950/20 rounded-lg p-4">
              {error}
            </div>
          )}

          {tips &&
            tips.map((tip, index) => (
              <div
                key={tip.id}
                style={{ animationDelay: `${index * 60}ms` }}
                className="animate-fade-up opacity-0 group rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 transition-all duration-200 hover:border-emerald-800/60 hover:bg-zinc-900 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-emerald-950/30"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-mono uppercase tracking-wide text-zinc-500 group-hover:text-emerald-500 transition-colors">
                    {formatDate(tip.scheduled_date)}
                  </span>
                  {index === 0 && (
                    <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-800/50">
                      New
                    </span>
                  )}
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed">{tip.tip_text}</p>
              </div>
            ))}

          {tips && tips.length === 0 && (
            <div className="text-sm text-zinc-500 border border-zinc-800 rounded-lg p-4">
              No tips published yet. Check back soon.
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
