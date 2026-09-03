'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, type SecurityReportData } from '@/lib/api';

const SEVERITY_STYLES: Record<string, string> = {
  critical: 'bg-red-100 text-red-700',
  high: 'bg-orange-100 text-orange-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-blue-100 text-blue-700',
};

const STATUS_STYLES: Record<string, string> = {
  new: 'bg-purple-100 text-purple-700',
  acknowledged: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-amber-100 text-amber-700',
  resolved: 'bg-green-100 text-green-700',
};

export default function AdminSecurityReportsPage() {
  const [reports, setReports] = useState<SecurityReportData[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchReports = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getSecurityReports(page, 20, statusFilter || undefined, severityFilter || undefined);
      setReports(res.data);
      setMeta(res.meta);
    } catch { /* */ } finally { setLoading(false); }
  }, [severityFilter, statusFilter]);

  useEffect(() => { fetchReports(1); }, [fetchReports]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">🔒 Security Reports</h2>
        <span className="text-sm text-neutral-500">{meta.total} total</span>
      </div>

      <div className="card bg-amber-50 border-amber-200">
        <p className="text-sm text-amber-800">
          ⚠️ Security reports are confidential. Handle with care and never share reporter PII outside the security team.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select className="input w-auto text-sm" value={severityFilter} onChange={(e) => setSeverityFilter(e.target.value)}>
          <option value="">All severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <select className="input w-auto text-sm" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="acknowledged">Acknowledged</option>
          <option value="in_progress">In Progress</option>
          <option value="resolved">Resolved</option>
        </select>
      </div>

      {loading ? (
        <div className="card text-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" /></div>
      ) : reports.length === 0 ? (
        <div className="card text-center py-12"><p className="text-neutral-500">No security reports found.</p></div>
      ) : (
        <div className="space-y-3">
          {reports.map((r) => (
            <div key={r.id} className="card">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-neutral-900 truncate">{r.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${SEVERITY_STYLES[r.severity] || ''}`}>{r.severity}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_STYLES[r.status] || ''}`}>{r.status.replace('_', ' ')}</span>
                  </div>
                </div>
                <button onClick={() => setExpandedId(expandedId === r.id ? null : r.id)} className="text-sm text-primary-600 hover:text-primary-700 flex-shrink-0">
                  {expandedId === r.id ? 'Collapse' : 'Expand'}
                </button>
              </div>
              <p className="text-xs text-neutral-400 mb-2">Submitted {new Date(r.createdAt).toLocaleDateString()}</p>

              {expandedId === r.id && (
                <div className="border-t border-neutral-200 pt-3 space-y-3">
                  <div>
                    <p className="text-xs font-medium text-neutral-500 mb-1">Description</p>
                    <p className="text-sm text-neutral-700 whitespace-pre-wrap">{r.description}</p>
                  </div>
                  {r.proofOfConcept && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-1">Proof of Concept</p>
                      <a href={r.proofOfConcept} target="_blank" rel="noopener noreferrer" className="text-sm text-primary-600 hover:text-primary-700">{r.proofOfConcept}</a>
                    </div>
                  )}
                  {r.contactEmail && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-1">Contact</p>
                      <p className="text-sm text-neutral-700">{r.contactEmail}</p>
                    </div>
                  )}
                  {r.internalNotes && (
                    <div>
                      <p className="text-xs font-medium text-neutral-500 mb-1">Internal Notes</p>
                      <p className="text-sm text-neutral-700 italic">{r.internalNotes}</p>
                    </div>
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
            <button key={p} onClick={() => fetchReports(p)} className={`w-8 h-8 rounded text-sm ${p === meta.page ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
