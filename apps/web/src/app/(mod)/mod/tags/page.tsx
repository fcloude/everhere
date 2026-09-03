'use client';

import { useState, useEffect } from 'react';
import { api, type ModQueue, ApiError } from '@/lib/api';

export default function ModTagsPage() {
  const [tags, setTags] = useState<ModQueue['tags']>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api.getModQueue()
      .then((q) => setTags(q.tags))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleApprove = async (id: string) => {
    setActionId(id);
    setMessage(null);
    try {
      await api.approveTag(id);
      setMessage({ type: 'success', text: 'Tag approved.' });
      setTags((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed' });
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <div className="card text-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" /><p className="text-sm text-neutral-500">Loading tags…</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Pending Tags</h2>
        <span className="text-sm text-neutral-500">{tags.length} pending</span>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`} role="status">{message.text}</div>
      )}

      {tags.length === 0 ? (
        <div className="card text-center py-12"><p className="text-neutral-500">No pending tags.</p></div>
      ) : (
        <div className="card">
          <div className="space-y-3">
            {tags.map((tag) => (
              <div key={tag.id} className="flex items-center justify-between py-3 border-b border-neutral-100 last:border-0">
                <div>
                  <span className="font-medium text-neutral-900">{tag.name}</span>
                  <span className="text-xs text-neutral-400 ml-2">· Created {new Date(tag.createdAt).toLocaleDateString()}</span>
                </div>
                <button
                  onClick={() => handleApprove(tag.id)}
                  disabled={actionId === tag.id}
                  className="px-4 py-1.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  {actionId === tag.id ? 'Approving…' : 'Approve'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
