'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api, type PaginatedData, type AdminUser, type AdminApplication, type AuditLogEntry } from '@/lib/api';

export default function AdminOverviewPage() {
  const [userCount, setUserCount] = useState<number | null>(null);
  const [pendingApps, setPendingApps] = useState<number | null>(null);
  const [recentLogs, setRecentLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAdminUsers(1, 1).catch(() => ({ data: [], meta: { page: 1, limit: 1, total: 0, totalPages: 0 } } as PaginatedData<AdminUser>)),
      api.getAdminApplications(1, 1, 'pending').catch(() => ({ data: [], meta: { page: 1, limit: 1, total: 0, totalPages: 0 } } as PaginatedData<AdminApplication>)),
      api.getAuditLogs(1, 5).catch(() => ({ data: [], meta: { page: 1, limit: 5, total: 0, totalPages: 0 } } as PaginatedData<AuditLogEntry>)),
    ]).then(([users, apps, logs]) => {
      setUserCount(users.meta.total);
      setPendingApps(apps.meta.total);
      setRecentLogs(logs.data);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="card text-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" /><p className="text-sm text-neutral-500">Loading…</p></div>;
  }

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Link href="/admin/users" className="card hover:shadow-md transition-shadow group">
          <p className="text-3xl font-bold text-neutral-900">{userCount ?? 0}</p>
          <p className="text-sm text-neutral-500 group-hover:text-primary-600">Total Users</p>
        </Link>
        <Link href="/admin/applications" className="card hover:shadow-md transition-shadow group">
          <p className="text-3xl font-bold text-amber-600">{pendingApps ?? 0}</p>
          <p className="text-sm text-neutral-500 group-hover:text-primary-600">Pending Applications</p>
        </Link>
        <Link href="/admin/audit-logs" className="card hover:shadow-md transition-shadow group">
          <p className="text-3xl font-bold text-neutral-400">→</p>
          <p className="text-sm text-neutral-500 group-hover:text-primary-600">View Full Audit Log</p>
        </Link>
      </div>

      {/* Quick links */}
      <div className="card">
        <h2 className="font-semibold text-neutral-900 mb-4">Quick Actions</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {adminLinks.slice(1).map((link) => (
            <Link key={link.href} href={link.href} className="flex items-center gap-3 p-3 rounded-lg border border-neutral-200 hover:border-primary-300 hover:bg-primary-50 transition-colors">
              <span className="text-lg">{link.icon}</span>
              <span className="text-sm font-medium text-neutral-700">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent audit entries */}
      {recentLogs.length > 0 && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-neutral-900">Recent Activity</h2>
            <Link href="/admin/audit-logs" className="text-sm text-primary-600 hover:text-primary-700">View all →</Link>
          </div>
          <div className="space-y-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="flex items-center gap-3 py-2 border-b border-neutral-100 last:border-0 text-sm">
                <span className="w-2 h-2 rounded-full bg-primary-400 flex-shrink-0" />
                <span className="font-medium text-neutral-900">{log.actor}</span>
                <span className="text-neutral-500">{log.action}</span>
                <span className="text-neutral-400">on {log.targetType}</span>
                <span className="text-xs text-neutral-400 ml-auto">{new Date(log.createdAt).toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const adminLinks = [
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/applications', label: 'Applications', icon: '📋' },
  { href: '/admin/contributions', label: 'Contributions', icon: '📄' },
  { href: '/admin/security-reports', label: 'Security Reports', icon: '🔒' },
  { href: '/admin/audit-logs', label: 'Audit Log', icon: '📝' },
];
