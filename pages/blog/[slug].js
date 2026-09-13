import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { parseMarkdown } from '../../lib/markdown';
import CodeBlock from '../../components/CodeBlock';

function renderMarkdownBlock(block, idx) {
  switch (block.type) {
    case 'h1':
      return (
        <h1 key={idx} className="text-3xl font-bold text-white mt-8 mb-4">
          {block.content}
        </h1>
      );
    case 'h2':
      return (
        <h2 key={idx} className="text-2xl font-bold text-white mt-6 mb-3">
          {block.content}
        </h2>
      );
    case 'code':
      return (
        <CodeBlock
          key={idx}
          code={block.content}
          track={block.language === 'javascript' ? 'node' : 'python'}
          className="mb-6"
        />
      );
    case 'li':
      return (
        <li key={idx} className="text-zinc-300 text-sm leading-relaxed ml-4 mb-1">
          {block.content}
        </li>
      );
    case 'paragraph':
      return (
        <p key={idx} className="text-zinc-300 leading-relaxed mb-4">
          {block.content}
        </p>
      );
    default:
      return null;
  }
}

export default function BlogPostPage() {
  const router = useRouter();
  const { slug } = router.query;
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [parsed, setParsed] = useState([]);

  useEffect(() => {
    if (!slug) return;

    let cancelled = false;

    fetch(`/api/blog/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Post not found');
        return res.json();
      })
      .then((data) => {
        if (!cancelled) {
          setPost(data);
          setParsed(parseMarkdown(data.content));
        }
      })
      .catch((err) => {
        if (!cancelled) setError(err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (!slug) return <div className="text-zinc-500">Loading...</div>;
  if (error) return <div className="text-rose-400">{error}</div>;
  if (!post) return <div className="text-zinc-500">Loading...</div>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-300 font-sans">
      <header className="border-b border-zinc-800 bg-zinc-950/70 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/blog" className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors duration-200">
            ← Back to blog
          </Link>
          <h1 className="text-lg font-bold text-white">Blog</h1>
          <div style={{ width: '80px' }} />
        </div>
      </header>

      <article className="max-w-3xl mx-auto px-4 py-12">
        <header className="mb-12">
          <p className="text-xs font-mono uppercase tracking-wide text-zinc-500 mb-3">{post.published_at}</p>
          <h1 className="text-4xl font-bold text-white mb-4">{post.title}</h1>
          <p className="text-lg text-zinc-400">{post.excerpt}</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-4">
          {parsed.map((block, i) => {
            // Group consecutive list items
            if (block.type === 'li') {
              const liItems = [block];
              let j = i + 1;
              while (j < parsed.length && parsed[j].type === 'li') {
                liItems.push(parsed[j]);
                j++;
              }
              if (i === 0 || parsed[i - 1].type !== 'li') {
                return (
                  <ul key={i} className="list-disc space-y-2 mb-4">
                    {liItems.map((item, idx) => (
                      <li key={idx} className="text-zinc-300 text-sm leading-relaxed ml-4">
                        {item.content}
                      </li>
                    ))}
                  </ul>
                );
              }
            }
            return renderMarkdownBlock(block, i);
          })}
        </div>

        <footer className="mt-12 pt-8 border-t border-zinc-800">
          <Link href="/blog">
            <a className="inline-block px-4 py-2 text-sm rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-colors duration-200">
              ← Back to all posts
            </a>
          </Link>
        </footer>
      </article>
    </div>
  );
}
