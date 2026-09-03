'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, type AuditLogEntry } from '@/lib/api';

const ACTION_COLORS: Record<string, string> = {
  'contribution.approved': 'text-green-600',
  'contribution.rejected': 'text-red-600',
  'feedback.in-review': 'text-blue-600',
  'feedback.resolved': 'text-green-600',
  'tag.approve': 'text-purple-600',
  'role.change': 'text-amber-600',
  'user.deactivate': 'text-red-600',
  'user.activate': 'text-green-600',
  'flag.create': 'text-red-600',
  'flag.resolve': 'text-green-600',
};

export default function AdminAuditLogsPage() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [actionFilter, setActionFilter] = useState('');
  const [targetFilter, setTargetFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const fetchLogs = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getAuditLogs(page, 50, {
        action: actionFilter || undefined,
        targetType: targetFilter || undefined,
      });
      setLogs(res.data);
      setMeta(res.meta);
    } catch { /* */ } finally { setLoading(false); }
  }, [actionFilter, targetFilter]);

  useEffect(() => { fetchLogs(1); }, [fetchLogs]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">📝 Audit Log</h2>
        <span className="text-sm text-neutral-500">{meta.total} entries</span>
      </div>

      <div className="card bg-neutral-50 border-neutral-200">
        <p className="text-sm text-neutral-600">
          This log is read-only and append-only. All privileged actions are recorded here.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <select className="input w-auto text-sm" value={actionFilter} onChange={(e) => setActionFilter(e.target.value)}>
          <option value="">All actions</option>
          <option value="contribution.approved">Contribution Approved</option>
          <option value="contribution.rejected">Contribution Rejected</option>
          <option value="role.change">Role Change</option>
          <option value="user.deactivate">User Deactivated</option>
          <option value="user.activate">User Activated</option>
          <option value="flag.create">Flag Created</option>
          <option value="flag.resolve">Flag Resolved</option>
          <option value="feedback.resolved">Feedback Resolved</option>
          <option value="tag.approve">Tag Approved</option>
        </select>
        <select className="input w-auto text-sm" value={targetFilter} onChange={(e) => setTargetFilter(e.target.value)}>
          <option value="">All targets</option>
          <option value="user">User</option>
          <option value="contribution">Contribution</option>
          <option value="feedback">Feedback</option>
          <option value="tag">Tag</option>
          <option value="moderation_flag">Flag</option>
          <option value="application">Application</option>
        </select>
      </div>

      {loading ? (
        <div className="card text-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" /></div>
      ) : logs.length === 0 ? (
        <div className="card text-center py-12"><p className="text-neutral-500">No audit entries found.</p></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="pb-3 font-medium">Time</th>
                <th className="pb-3 font-medium">Actor</th>
                <th className="pb-3 font-medium">Action</th>
                <th className="pb-3 font-medium">Target</th>
                <th className="pb-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <>
                  <tr key={log.id} className="border-b border-neutral-100 hover:bg-neutral-50">
                    <td className="py-3 text-xs text-neutral-500 whitespace-nowrap">{new Date(log.createdAt).toLocaleString()}</td>
                    <td className="py-3">
                      <p className="font-medium text-neutral-900">{log.actor}</p>
                      <p className="text-xs text-neutral-400">{log.actorEmail}</p>
                    </td>
                    <td className="py-3">
                      <span className={`text-xs font-medium ${ACTION_COLORS[log.action] || 'text-neutral-600'}`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="py-3 text-xs text-neutral-500">
                      {log.targetType}
                      {log.targetId && <span className="text-neutral-400 ml-1">({log.targetId.slice(0, 8)}…)</span>}
                    </td>
                    <td className="py-3">
                      {(log.before || log.after) && (
                        <button
                          onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                          className="text-xs text-primary-600 hover:text-primary-700"
                        >
                          {expandedId === log.id ? 'Hide' : 'Show'} diff
                        </button>
                      )}
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr key={`${log.id}-detail`} className="border-b border-neutral-100 bg-neutral-50">
                      <td colSpan={5} className="py-3 px-4">
                        <div className="flex gap-6 text-xs">
                          {log.before && (
                            <div>
                              <span className="font-medium text-red-600">Before:</span>
                              <pre className="mt-1 text-neutral-600 whitespace-pre-wrap">{JSON.stringify(log.before, null, 2)}</pre>
                            </div>
                          )}
                          {log.after && (
                            <div>
                              <span className="font-medium text-green-600">After:</span>
                              <pre className="mt-1 text-neutral-600 whitespace-pre-wrap">{JSON.stringify(log.after, null, 2)}</pre>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: Math.min(meta.totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => fetchLogs(p)} className={`w-8 h-8 rounded text-sm ${p === meta.page ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}>{p}</button>
          ))}
        </div>
      )}
    </div>
  );
}
