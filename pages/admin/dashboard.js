import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [queues, setQueues] = useState({ pending: [], reported: [] });
  const [details, setDetails] = useState({ users: [], activeToday: [], officialQuestions: [] });
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, queuesRes, detailsRes] = await Promise.all([
          fetch('/api/admin/stats'),
          fetch('/api/admin/queues'),
          fetch('/api/admin/details')
        ]);

        if (statsRes.status === 401 || statsRes.status === 403) {
          window.location.href = '/';
          return;
        }

        setStats(await statsRes.json());
        setQueues(await queuesRes.json());
        if (detailsRes.ok) {
          setDetails(await detailsRes.json());
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleAction = async (id, action) => {
    if (!confirm(`Are you sure you want to ${action} this question?`)) return;
    
    try {
      const res = await fetch('/api/admin/questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, action }),
      });
      
      if (res.ok) {
        const queuesRes = await fetch('/api/admin/queues');
        setQueues(await queuesRes.json());
        alert(`Question ${action}d successfully!`);
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return <div className="min-h-screen bg-black text-white flex items-center justify-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans selection:bg-indigo-500/30">
      <Head>
        <title>CodeBits Admin</title>
      </Head>

      <header className="sticky top-0 z-50 bg-black/80 backdrop-blur-md border-b border-zinc-900">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold tracking-tight text-white flex items-center gap-3">
              <img src="/logo.png" alt="Chronocode" className="h-7 w-auto object-contain" />
              CodeBits <span className="text-indigo-500 text-sm px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">Admin</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button 
                onClick={() => setActiveTab('overview')} 
                className={`transition-colors ${activeTab === 'overview' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Command Center
              </button>
              <button 
                onClick={() => setActiveTab('moderation')} 
                className={`transition-colors ${activeTab === 'moderation' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Moderation Queue
                {queues.pending.length > 0 && (
                  <span className="ml-2 bg-indigo-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">{queues.pending.length}</span>
                )}
              </button>
              <button 
                onClick={() => setActiveTab('directory')} 
                className={`transition-colors ${activeTab === 'directory' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
              >
                Directory
              </button>
            </nav>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fade-up">
            <h1 className="text-2xl font-semibold">Command Center</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div onClick={() => setActiveTab('directory')} className="cursor-pointer p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 transition-colors">
                <div className="text-sm text-zinc-400 mb-2">Total Users</div>
                <div className="text-3xl font-mono">{stats?.totalUsers || 0}</div>
              </div>
              <div onClick={() => setActiveTab('directory')} className="cursor-pointer p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 transition-colors">
                <div className="text-sm text-zinc-400 mb-2">Active Today</div>
                <div className="text-3xl font-mono text-emerald-400">{stats?.activeToday || 0}</div>
              </div>
              <div onClick={() => setActiveTab('directory')} className="cursor-pointer p-6 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 transition-colors">
                <div className="text-sm text-zinc-400 mb-2">Official Questions</div>
                <div className="text-3xl font-mono text-indigo-400">{stats?.officialQuestions || 0}</div>
              </div>
              <div className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/50">
                <div className="text-sm text-zinc-400 mb-2">Community Questions</div>
                <div className="text-3xl font-mono text-amber-400">{stats?.communityQuestions || 0}</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'directory' && (
          <div className="space-y-12 animate-fade-up">
            <h1 className="text-2xl font-semibold">Directory</h1>
            
            {/* Active Today Table */}
            <section>
              <h2 className="text-lg font-medium text-emerald-400 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                Active Today ({details.activeToday.length})
              </h2>
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400">
                    <tr>
                      <th className="p-4 font-medium">ID</th>
                      <th className="p-4 font-medium">Username</th>
                      <th className="p-4 font-medium">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {details.activeToday.map(u => (
                      <tr key={u.id} className="hover:bg-zinc-800/30">
                        <td className="p-4 text-zinc-500 font-mono">{u.id}</td>
                        <td className="p-4">{u.username}</td>
                        <td className="p-4 text-zinc-400">{u.email}</td>
                      </tr>
                    ))}
                    {details.activeToday.length === 0 && (
                      <tr><td colSpan="3" className="p-4 text-center text-zinc-500">No active users today</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Total Users Table */}
            <section>
              <h2 className="text-lg font-medium text-white mb-4">All Users ({details.users.length})</h2>
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400">
                    <tr>
                      <th className="p-4 font-medium">ID</th>
                      <th className="p-4 font-medium">Username</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {details.users.map(u => (
                      <tr key={u.id} className="hover:bg-zinc-800/30">
                        <td className="p-4 text-zinc-500 font-mono">{u.id}</td>
                        <td className="p-4 font-medium">{u.username}</td>
                        <td className="p-4 text-zinc-400">{u.email}</td>
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded text-xs ${u.role === 'admin' ? 'bg-indigo-500/20 text-indigo-400' : 'bg-zinc-800 text-zinc-400'}`}>
                            {u.role || 'user'}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* Official Questions Table */}
            <section>
              <h2 className="text-lg font-medium text-indigo-400 mb-4">Official Questions ({details.officialQuestions.length})</h2>
              <div className="bg-zinc-900/30 rounded-xl border border-zinc-800 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-zinc-900/80 border-b border-zinc-800 text-zinc-400">
                    <tr>
                      <th className="p-4 font-medium">ID</th>
                      <th className="p-4 font-medium">Track</th>
                      <th className="p-4 font-medium w-1/2">Question</th>
                      <th className="p-4 font-medium">Difficulty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {details.officialQuestions.map(q => (
                      <tr key={q.id} className="hover:bg-zinc-800/30">
                        <td className="p-4 text-zinc-500 font-mono">{q.id}</td>
                        <td className="p-4">
                          <span className="px-2 py-1 bg-zinc-800 rounded text-xs capitalize">{q.track}</span>
                        </td>
                        <td className="p-4 text-zinc-300 truncate max-w-xs">{q.question_text}</td>
                        <td className="p-4 text-zinc-400">{q.difficulty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}

        {activeTab === 'moderation' && (
          <div className="space-y-8 animate-fade-up">
            <h1 className="text-2xl font-semibold">Moderation Queue</h1>
            
            <div className="space-y-12">
              <section>
                <h2 className="text-lg font-medium text-rose-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                  Reported (High Priority)
                </h2>
                {queues.reported.length === 0 ? (
                  <div className="text-zinc-500 text-sm">No reported questions.</div>
                ) : (
                  <div className="space-y-4">
                    {queues.reported.map(q => (
                      <div key={q.id} className="p-6 rounded-xl border border-rose-900/50 bg-rose-950/10 space-y-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-medium text-lg">{q.question_text}</h3>
                          <span className="bg-rose-500/20 text-rose-400 px-3 py-1 rounded-full text-xs border border-rose-500/30">
                            {q.report_count} Reports
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => handleAction(q.id, 'suspend')} className="bg-rose-900 hover:bg-rose-800 text-white px-4 py-2 rounded text-sm transition-colors">
                            Suspend
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section>
                <h2 className="text-lg font-medium text-indigo-400 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  Pending Approval
                </h2>
                {queues.pending.length === 0 ? (
                  <div className="text-zinc-500 text-sm">No pending questions.</div>
                ) : (
                  <div className="space-y-4">
                    {queues.pending.map(q => (
                      <div key={q.id} className="p-6 rounded-xl border border-zinc-800 bg-zinc-900/30 space-y-4">
                        <div>
                          <div className="text-sm text-zinc-500 mb-1">Track: {q.track} | Author: {q.author_name || 'Anonymous'}</div>
                          <h3 className="font-medium text-lg">{q.question_text}</h3>
                        </div>
                        {q.code_snippet && (
                          <pre className="p-4 bg-black rounded border border-zinc-800 text-sm font-mono overflow-x-auto text-zinc-300">
                            {q.code_snippet}
                          </pre>
                        )}
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          {q.options.map((opt, i) => (
                            <div key={i} className={`p-2 rounded border ${i === q.correct_index ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-zinc-800 bg-zinc-900'}`}>
                              {opt}
                            </div>
                          ))}
                        </div>
                        <div className="text-sm text-zinc-400 bg-black/50 p-4 rounded border border-zinc-800">
                          <span className="text-zinc-500 mr-2">Explanation:</span>{q.explanation}
                        </div>
                        <div className="flex gap-2 pt-2 border-t border-zinc-800">
                          <button onClick={() => handleAction(q.id, 'approve')} className="bg-emerald-900 hover:bg-emerald-800 text-white px-4 py-2 rounded text-sm transition-colors">
                            Approve
                          </button>
                          <button onClick={() => handleAction(q.id, 'reject')} className="bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded text-sm transition-colors">
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
