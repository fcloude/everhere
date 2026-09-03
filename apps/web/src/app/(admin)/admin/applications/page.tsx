'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, type AdminApplication, ApiError } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<AdminApplication[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionId, setActionId] = useState<string | null>(null);
  const [reviewNotes, setReviewNotes] = useState<Record<string, string>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchApps = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getAdminApplications(page, 20, statusFilter || undefined);
      setApplications(res.data);
      setMeta(res.meta);
    } catch { /* */ } finally { setLoading(false); }
  }, [statusFilter]);

  useEffect(() => { fetchApps(1); }, [fetchApps]);

  const handleReview = async (id: string, decision: 'approved' | 'rejected') => {
    setActionId(id);
    setMessage(null);
    try {
      await api.reviewApplication(id, decision, reviewNotes[id] || undefined);
      setMessage({ type: 'success', text: `Application ${decision}.` });
      setExpandedId(null);
      fetchApps(meta.page);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed' });
    } finally { setActionId(null); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Applications</h2>
        <span className="text-sm text-neutral-500">{meta.total} total</span>
      </div>

      <div className="flex gap-2">
        {['pending', 'approved', 'rejected', ''].map((s) => (
          <button
            key={s}
            onClick={() => setStatusFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium ${statusFilter === s ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
          >
            {s || 'All'}
          </button>
        ))}
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`} role="status">{message.text}</div>
      )}

      {loading ? (
        <div className="card text-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" /></div>
      ) : applications.length === 0 ? (
        <div className="card text-center py-12"><p className="text-neutral-500">No applications found.</p></div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-medium text-neutral-900">{app.displayName}</h3>
                  <p className="text-sm text-neutral-500">{app.email}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[app.status] || 'bg-neutral-100'}`}>{app.status}</span>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 text-sm mb-3">
                <div><span className="text-neutral-500">Role:</span> <span className="capitalize">{app.preferredRole}</span></div>
                <div><span className="text-neutral-500">Skills:</span> {app.skills.join(', ')}</div>
                {app.portfolioLinks.length > 0 && (
                  <div className="sm:col-span-2"><span className="text-neutral-500">Links:</span> {app.portfolioLinks.map((l) => (
                    <a key={l} href={l} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 ml-1">{l}</a>
                  ))}</div>
                )}
                {app.message && <div className="sm:col-span-2 text-neutral-600 italic">“{app.message}”</div>}
              </div>
              <p className="text-xs text-neutral-400 mb-3">Submitted {new Date(app.createdAt).toLocaleDateString()}</p>

              {app.status === 'pending' && (
                <div className="border-t border-neutral-200 pt-3">
                  {expandedId === app.id ? (
                    <div className="space-y-3">
                      <textarea
                        className="input text-sm min-h-[50px]"
                        placeholder="Review notes (optional, internal only)"
                        value={reviewNotes[app.id] || ''}
                        onChange={(e) => setReviewNotes((prev) => ({ ...prev, [app.id]: e.target.value }))}
                      />
                      <div className="flex gap-2">
                        <button onClick={() => handleReview(app.id, 'approved')} disabled={actionId === app.id} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                          {actionId === app.id ? 'Processing…' : 'Confirm Approve'}
                        </button>
                        <button onClick={() => handleReview(app.id, 'rejected')} disabled={actionId === app.id} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                          {actionId === app.id ? 'Processing…' : 'Confirm Reject'}
                        </button>
                        <button onClick={() => setExpandedId(null)} className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => setExpandedId(app.id)} className="btn-primary text-sm">Review Application</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchApps(p)} className={`w-8 h-8 rounded text-sm ${p === meta.page ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
