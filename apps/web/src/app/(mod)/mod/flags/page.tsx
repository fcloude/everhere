'use client';

import { useState, useEffect } from 'react';
import { api, type ModQueue, ApiError } from '@/lib/api';

export default function ModFlagsPage() {
  const [flags, setFlags] = useState<ModQueue['flags']>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api.getModQueue()
      .then((q) => setFlags(q.flags))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleResolve = async (id: string) => {
    setActionId(id);
    setMessage(null);
    try {
      await api.resolveFlag(id);
      setMessage({ type: 'success', text: 'Flag resolved.' });
      setFlags((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed' });
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <div className="card text-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" /><p className="text-sm text-neutral-500">Loading flags…</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Flagged Accounts</h2>
        <span className="text-sm text-neutral-500">{flags.length} open</span>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`} role="status">{message.text}</div>
      )}

      {flags.length === 0 ? (
        <div className="card text-center py-12"><p className="text-neutral-500">No open flags.</p></div>
      ) : (
        <div className="space-y-4">
          {flags.map((flag) => (
            <div key={flag.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="font-medium text-neutral-900">{flag.flaggedUser.displayName}</h3>
                  <p className="text-xs text-neutral-500">{flag.flaggedUser.email}</p>
                </div>
                <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Flagged</span>
              </div>
              <p className="text-sm text-neutral-600 mb-2"><strong>Reason:</strong> {flag.reason}</p>
              <p className="text-xs text-neutral-400 mb-4">
                Flagged by {flag.flaggedByMod.displayName} · {new Date(flag.createdAt).toLocaleDateString()}
              </p>
              <div className="flex gap-2 border-t border-neutral-200 pt-3">
                <button
                  onClick={() => handleResolve(flag.id)}
                  disabled={actionId === flag.id}
                  className="px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {actionId === flag.id ? 'Resolving…' : 'Resolve Flag'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
