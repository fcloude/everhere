'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, type ContributionData } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminContributionsPage() {
  const [contributions, setContributions] = useState<ContributionData[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchContributions = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.getAdminContributions(page, 20, statusFilter || undefined);
      setContributions(res.data);
      setMeta(res.meta);
    } catch { /* */ } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchContributions(1); }, [fetchContributions]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">All Contributions</h2>
        <span className="text-sm text-neutral-500">{meta.total} total</span>
      </div>

      <div className="flex gap-2">
        {['', 'pending', 'approved', 'rejected'].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card text-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" /></div>
      ) : contributions.length === 0 ? (
        <div className="card text-center py-12"><p className="text-neutral-500">No contributions found.</p></div>
      ) : (
        <div className="space-y-3">
          {contributions.map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-neutral-900 truncate">{c.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[c.status] || ''}`}>{c.status}</span>
                  </div>
                  {c.description && <p className="text-sm text-neutral-500 line-clamp-2 mb-1">{c.description}</p>}
                  <div className="flex items-center gap-4 text-xs text-neutral-400">
                    <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 truncate max-w-xs">{c.url}</a>
                    <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                  {c.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {c.tags.map((t) => (
                        <span key={t.id} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-full">{t.name}</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchContributions(p)} className={`w-8 h-8 rounded text-sm ${p === meta.page ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
