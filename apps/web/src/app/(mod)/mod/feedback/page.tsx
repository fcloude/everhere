'use client';

import { useState, useEffect } from 'react';
import { api, type ModQueue, ApiError } from '@/lib/api';

const STATUS_OPTIONS = [
  { value: 'in-review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'wontfix', label: "Won't Fix" },
];

export default function ModFeedbackPage() {
  const [items, setItems] = useState<ModQueue['feedback']>([]);
  const [loading, setLoading] = useState(true);
  const [actionId, setActionId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    api.getModQueue()
      .then((q) => setItems(q.feedback))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleStatus = async (id: string, status: string) => {
    setActionId(id);
    setMessage(null);
    try {
      await api.moderateFeedback(id, status, notes[id] || undefined);
      setMessage({ type: 'success', text: 'Feedback status updated.' });
      setItems((prev) => prev.filter((f) => f.id !== id));
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed' });
    } finally {
      setActionId(null);
    }
  };

  if (loading) {
    return <div className="card text-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" /><p className="text-sm text-neutral-500">Loading feedback…</p></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">Feedback Queue</h2>
        <span className="text-sm text-neutral-500">{items.length} new</span>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`} role="status">{message.text}</div>
      )}

      {items.length === 0 ? (
        <div className="card text-center py-12"><p className="text-neutral-500">No new feedback.</p></div>
      ) : (
        <div className="space-y-4">
          {items.map((f) => (
            <div key={f.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div>
                  <h3 className="font-medium text-neutral-900">{f.title}</h3>
                  <p className="text-xs text-neutral-500 capitalize">{f.category.replace('-', ' ')} · {new Date(f.createdAt).toLocaleDateString()}</p>
                </div>
                <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">New</span>
              </div>
              <p className="text-sm text-neutral-600 mb-3 whitespace-pre-wrap">{f.description}</p>
              {f.email && <p className="text-xs text-neutral-400 mb-3">Contact: {f.email}</p>}

              {/* Internal notes */}
              <div className="mb-3">
                <label className="block text-xs font-medium text-neutral-500 mb-1">Internal Notes (not shown to submitter)</label>
                <textarea
                  className="input text-sm min-h-[50px]"
                  placeholder="Add internal notes…"
                  value={notes[f.id] || ''}
                  onChange={(e) => setNotes((prev) => ({ ...prev, [f.id]: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 border-t border-neutral-200 pt-3">
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleStatus(f.id, opt.value)}
                    disabled={actionId === f.id}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium disabled:opacity-50 ${
                      opt.value === 'resolved' ? 'bg-green-100 text-green-700 hover:bg-green-200'
                      : opt.value === 'wontfix' ? 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                      : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
