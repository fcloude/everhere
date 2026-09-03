'use client';

import { useState, useEffect } from 'react';
import { api, type ModQueue, ApiError } from '@/lib/api';

export default function ModContributionsPage() {
  const [queue, setQueue] = useState<ModQueue['contributions']>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [showRejectFor, setShowRejectFor] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchQueue = async () => {
    try {
      const data = await api.getModQueue();
      setQueue(data.contributions);
    } catch {
      // silently fail
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQueue(); }, []);

  const handleDecision = async (id: string, decision: 'approved' | 'rejected', reason?: string) => {
    setActionId(id);
    setMessage(null);
    try {
      await api.moderateContribution(id, decision, reason);
      setMessage({ type: 'success', text: `Contribution ${decision}.` });
      setQueue((prev) => prev.filter((c) => c.id !== id));
      setShowRejectFor(null);
      setRejectReason('');
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof ApiError ? err.message : 'Action failed' });
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <div className="card text-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" /><p className="text-sm text-neutral-500">Loading contributions…</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Contribution Queue</h2>
        <span className="text-sm text-neutral-500">{queue.length} pending</span>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`} role="status">
          {message.text}
        </div>
      )}

      {queue.length === 0 ? (
        <div className="card text-center py-12">
          <p className="text-neutral-500">No pending contributions.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {queue.map((c) => (
            <div key={c.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="min-w-0">
                  <h3 className="font-medium text-neutral-900">{c.title}</h3>
                  <p className="text-sm text-neutral-500">by {c.user.displayName}</p>
                </div>
                <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full flex-shrink-0">Pending</span>
              </div>
              {c.description && <p className="text-sm text-neutral-600 mb-3">{c.description}</p>}
              <div className="flex items-center gap-4 text-xs text-neutral-400 mb-4">
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="text-primary-600 hover:text-primary-700 truncate max-w-md">{c.url}</a>
                <span>{new Date(c.createdAt).toLocaleDateString()}</span>
              </div>
              {showRejectFor === c.id ? (
                <div className="border-t border-neutral-200 pt-4 space-y-3">
                  <textarea
                    className="input min-h-[60px]"
                    placeholder="Rejection reason (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                  />
                  <div className="flex gap-2">
                    <button onClick={() => handleDecision(c.id, 'rejected', rejectReason)} disabled={actionId === c.id} className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 disabled:opacity-50">
                      {actionId === c.id ? 'Processing…' : 'Confirm Reject'}
                    </button>
                    <button onClick={() => { setShowRejectFor(null); setRejectReason(''); }} className="px-4 py-2 rounded-lg bg-neutral-100 text-neutral-700 text-sm font-medium hover:bg-neutral-200">Cancel</button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 border-t border-neutral-200 pt-4">
                  <button onClick={() => handleDecision(c.id, 'approved')} disabled={actionId === c.id} className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50">
                    Approve
                  </button>
                  <button onClick={() => setShowRejectFor(c.id)} disabled={actionId === c.id} className="px-4 py-2 rounded-lg bg-red-100 text-red-700 text-sm font-medium hover:bg-red-200 disabled:opacity-50">
                    Reject
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
