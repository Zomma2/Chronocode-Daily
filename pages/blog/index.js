import React, { useEffect, useState } from 'react';
import Link from 'next/link';

export default function BlogPage() {
  const [track, setTrack] = useState('python');
  const [posts, setPosts] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setPosts(null);
    setError(null);

    fetch(`/api/blog/posts?track=${track}&limit=20`)
      .then((res) => {
        if (!res.ok) throw new Error('Could not load blog posts');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) setPosts(data.posts);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [track]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200">
            ← Back to daily
          </Link>
          <h1 className="text-lg font-bold text-white">Blog</h1>
          <div className="flex bg-zinc-900 p-1 rounded-lg border border-zinc-800">
            <button
              onClick={() => setTrack('python')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
                track === 'python' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Python
            </button>
            <button
              onClick={() => setTrack('node')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-colors duration-200 ${
                track === 'node' ? 'bg-zinc-700 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              Node.js
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-12">
        {error && <div className="text-rose-400 mb-6">{error}</div>}

        {!posts && !error && (
          <div className="space-y-6">
            {[0, 1, 2].map((i) => (
              <div key={i} className="skeleton animate-shimmer h-32 rounded-xl" />
            ))}
          </div>
        )}

        {posts && posts.length === 0 && <p className="text-zinc-500">No blog posts published yet.</p>}

        {posts &&
          posts.map((post, i) => (
            <article
              key={post.id}
              style={{ animationDelay: `${i * 50}ms` }}
              className="animate-fade-up opacity-0 border-b border-zinc-900 pb-8 mb-8 last:border-0 last:mb-0"
            >
              <p className="text-xs font-mono uppercase tracking-wide text-zinc-500 mb-2">{post.published_at}</p>
              <Link href={`/blog/${post.slug}`}>
                <a className="group">
                  <h2 className="text-2xl font-bold text-white mb-3 group-hover:text-emerald-400 transition-colors duration-200">
                    {post.title}
                  </h2>
                </a>
              </Link>
              <p className="text-zinc-400 leading-relaxed mb-4">{post.excerpt}</p>
              <Link href={`/blog/${post.slug}`}>
                <a className="inline-block px-4 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 hover:border-zinc-700 text-zinc-300 transition-colors duration-200">
                  Read more →
                </a>
              </Link>
            </article>
          ))}
      </main>
    </div>
  );
}
