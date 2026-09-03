'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, type ModQueue } from '@/lib/api';

export default function ModOverviewPage() {
  const [queue, setQueue] = useState<ModQueue | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.getModQueue()
      .then(setQueue)
      .catch((err) => setError(err instanceof Error ? err.message : 'Failed to load queue'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card text-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-neutral-500">Loading queue…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center py-12">
        <p className="text-sm text-red-600 mb-3">{error}</p>
        <button onClick={() => window.location.reload()} className="btn-secondary text-sm">Retry</button>
      </div>
    );
  }

  const stats = queue ? [
    { label: 'Pending Contributions', count: queue.contributions.length, href: '/mod/contributions', icon: '📄', color: 'bg-amber-100 text-amber-700' },
    { label: 'New Feedback', count: queue.feedback.length, href: '/mod/feedback', icon: '💬', color: 'bg-blue-100 text-blue-700' },
    { label: 'Pending Tags', count: queue.tags.length, href: '/mod/tags', icon: '🏷️', color: 'bg-purple-100 text-purple-700' },
    { label: 'Open Flags', count: queue.flags.length, href: '/mod/flags', icon: '🚩', color: 'bg-red-100 text-red-700' },
  ] : [];

  return (
    <div className="space-y-6">
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Link key={stat.label} href={stat.href} className="card hover:shadow-md transition-shadow group">
            <div className="flex items-center gap-3 mb-3">
              <span className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${stat.color}`}>
                {stat.icon}
              </span>
              <span className={`text-2xl font-bold ${stat.count > 0 ? 'text-neutral-900' : 'text-neutral-400'}`}>
                {stat.count}
              </span>
            </div>
            <p className="text-sm font-medium text-neutral-600 group-hover:text-primary-600 transition-colors">{stat.label}</p>
          </Link>
        ))}
      </div>

      {/* Recent items preview */}
      {queue && queue.contributions.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Pending Contributions</h2>
            <Link href="/mod/contributions" className="text-sm text-primary-600 hover:text-primary-700">View all →</Link>
          </div>
          <div className="space-y-3">
            {queue.contributions.slice(0, 5).map((c) => (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{c.title}</p>
                  <p className="text-xs text-neutral-500">by {c.user.displayName} · {new Date(c.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Pending</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {queue && queue.feedback.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Recent Feedback</h2>
            <Link href="/mod/feedback" className="text-sm text-primary-600 hover:text-primary-700">View all →</Link>
          </div>
          <div className="space-y-3">
            {queue.feedback.slice(0, 5).map((f) => (
              <div key={f.id} className="flex items-center justify-between py-2 border-b border-neutral-100 last:border-0">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-neutral-900 truncate">{f.title}</p>
                  <p className="text-xs text-neutral-500 capitalize">{f.category.replace('-', ' ')} · {new Date(f.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full capitalize">{f.status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {queue && queue.contributions.length === 0 && queue.feedback.length === 0 && queue.tags.length === 0 && queue.flags.length === 0 && (
        <div className="card text-center py-12">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center" aria-hidden="true">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-lg font-semibold text-neutral-900 mb-1">All caught up!</h2>
          <p className="text-sm text-neutral-500">No pending items in any queue.</p>
        </div>
      )}
    </div>
  );
}
