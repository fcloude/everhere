'use client';

import { useState, useEffect } from 'react';
import { api, type ContributionData, ApiError } from '@/lib/api';

const STATUS_STYLES: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  approved: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
};

export default function ContributionsPage() {
  const [contributions, setContributions] = useState<ContributionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // New contribution form
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [url, setUrl] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchContributions = async () => {
    try {
      setLoading(true);
      const data = await api.getMyContributions();
      setContributions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load contributions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContributions();
  }, []);

  const validateForm = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required';
    else if (title.trim().length < 3) errs.title = 'Title must be at least 3 characters';
    else if (title.trim().length > 200) errs.title = 'Title must be at most 200 characters';
    if (description.length > 2000) errs.description = 'Description must be at most 2000 characters';
    if (!url.trim()) errs.url = 'URL is required';
    else {
      try {
        const parsed = new URL(url.trim());
        if (!['http:', 'https:'].includes(parsed.protocol)) errs.url = 'Please enter a valid HTTP/HTTPS URL';
      } catch {
        errs.url = 'Please enter a valid URL';
      }
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      await api.submitContribution({
        title: title.trim(),
        description: description.trim() || undefined,
        url: url.trim(),
      });
      setSubmitSuccess(true);
      setTitle('');
      setDescription('');
      setUrl('');
      setShowForm(false);
      fetchContributions();
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Failed to submit contribution');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-neutral-900">My Contributions</h2>
          <p className="text-sm text-neutral-500">Submit and track your contributions</p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setSubmitSuccess(false); setSubmitError(null); }}
          className="btn-primary text-sm"
        >
          {showForm ? 'Cancel' : '+ New Contribution'}
        </button>
      </div>

      {/* Success message */}
      {submitSuccess && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm" role="status">
          Contribution submitted for review! It will appear once approved by a moderator.
        </div>
      )}

      {/* New contribution form */}
      {showForm && (
        <div className="card">
          <h3 className="text-md font-semibold text-neutral-900 mb-4">Submit a Contribution</h3>
          <p className="text-sm text-neutral-500 mb-4">
            Share a link to your work — a GitHub repo, design file, documentation, or article.
          </p>

          {submitError && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-4" role="alert">
              {submitError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="c-title" className="block text-sm font-medium text-neutral-700 mb-1">Title *</label>
              <input
                id="c-title"
                className={`input ${formErrors.title ? 'border-red-400' : ''}`}
                placeholder="e.g. EVERHERE Landing Page Redesign"
                value={title}
                onChange={(e) => { setTitle(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.title; return n; }); }}
                disabled={submitting}
              />
              {formErrors.title && <p className="mt-1 text-sm text-red-600">{formErrors.title}</p>}
            </div>

            <div>
              <label htmlFor="c-description" className="block text-sm font-medium text-neutral-700 mb-1">
                Description <span className="text-neutral-400">(optional)</span>
              </label>
              <textarea
                id="c-description"
                className={`input min-h-[80px] ${formErrors.description ? 'border-red-400' : ''}`}
                placeholder="Brief description of what this is..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={2000}
                disabled={submitting}
              />
              <p className="mt-1 text-xs text-neutral-400 text-right">{description.length}/2000</p>
            </div>

            <div>
              <label htmlFor="c-url" className="block text-sm font-medium text-neutral-700 mb-1">URL *</label>
              <input
                id="c-url"
                type="url"
                className={`input ${formErrors.url ? 'border-red-400' : ''}`}
                placeholder="https://github.com/..."
                value={url}
                onChange={(e) => { setUrl(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n.url; return n; }); }}
                disabled={submitting}
              />
              {formErrors.url && <p className="mt-1 text-sm text-red-600">{formErrors.url}</p>}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary disabled:opacity-50"
            >
              {submitting ? 'Submitting…' : 'Submit for Review'}
            </button>
          </form>
        </div>
      )}

      {/* Contributions list */}
      <div className="card">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-neutral-500">Loading contributions…</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-sm text-red-600 mb-3">{error}</p>
            <button onClick={fetchContributions} className="btn-secondary text-sm">Retry</button>
          </div>
        ) : contributions.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-neutral-100 flex items-center justify-center" aria-hidden="true">
              <svg className="w-8 h-8 text-neutral-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-1">No contributions yet</h3>
            <p className="text-sm text-neutral-500 mb-4">
              Submit your first contribution to get started.
            </p>
            <button onClick={() => setShowForm(true)} className="btn-primary text-sm">
              Submit a Contribution
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {contributions.map((c) => (
              <div key={c.id} className="border border-neutral-200 rounded-lg p-4 hover:border-neutral-300 transition-colors">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-medium text-neutral-900 truncate">{c.title}</h3>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${STATUS_STYLES[c.status] || 'bg-neutral-100 text-neutral-600'}`}>
                        {c.status}
                      </span>
                    </div>
                    {c.description && (
                      <p className="text-sm text-neutral-500 line-clamp-2 mb-2">{c.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-neutral-400">
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary-600 hover:text-primary-700 truncate max-w-xs"
                      >
                        {c.url}
                      </a>
                      <span>Submitted {formatDate(c.createdAt)}</span>
                    </div>
                    {c.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {c.tags.map((t) => (
                          <span key={t.id} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                            {t.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
