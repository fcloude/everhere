'use client';

import { useState, useEffect, useCallback } from 'react';
import { api, type AdminUser, ApiError } from '@/lib/api';

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700',
  moderator: 'bg-purple-100 text-purple-700',
  contributor: 'bg-green-100 text-green-700',
  user: 'bg-blue-100 text-blue-700',
  visitor: 'bg-neutral-100 text-neutral-600',
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.getAdminUsers(page, 20, roleFilter || undefined, search || undefined);
      setUsers(res.data);
      setMeta(res.meta);
    } catch { /* */ } finally { setLoading(false); }
  }, [roleFilter, search]);

  useEffect(() => { fetchUsers(1); }, [fetchUsers]);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setMessage(null);
    try {
      const res = await api.changeUserRole(userId, newRole);
      if (res.requiresConfirmation) {
        const confirmed = window.confirm(`⚠️ Changing a privileged account requires confirmation.\n\nUser: ${res.targetUser?.displayName}\nCurrent: ${res.targetUser?.currentRole}\nProposed: ${res.proposedRole}\n\nConfirm role change?`);
        if (confirmed) {
          await api.changeUserRole(userId, newRole, 'confirmed');
        } else {
          return;
        }
      }
      setMessage({ type: 'success', text: `Role updated to ${newRole}.` });
      setEditingId(null);
      fetchUsers(meta.page);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed' });
    }
  };

  const handleToggleActive = async (userId: string, active: boolean) => {
    setMessage(null);
    try {
      await api.toggleUserActive(userId, active);
      setMessage({ type: 'success', text: `Account ${active ? 'activated' : 'deactivated'}.` });
      fetchUsers(meta.page);
    } catch (err) {
      setMessage({ type: 'error', text: err instanceof ApiError ? err.message : 'Failed' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-neutral-900">User Management</h2>
        <span className="text-sm text-neutral-500">{meta.total} users</span>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="search"
            className="input flex-1"
            placeholder="Search by name or email…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select className="input w-full sm:w-40" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
            <option value="">All roles</option>
            <option value="admin">Admin</option>
            <option value="moderator">Moderator</option>
            <option value="contributor">Contributor</option>
            <option value="user">User</option>
            <option value="visitor">Visitor</option>
          </select>
        </div>
      </div>

      {message && (
        <div className={`p-3 rounded-lg text-sm ${message.type === 'success' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'}`} role="status">{message.text}</div>
      )}

      {loading ? (
        <div className="card text-center py-12"><div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" /></div>
      ) : users.length === 0 ? (
        <div className="card text-center py-12"><p className="text-neutral-500">No users found.</p></div>
      ) : (
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-left text-neutral-500">
                <th className="pb-3 font-medium">User</th>
                <th className="pb-3 font-medium">Role</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium">Joined</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="border-b border-neutral-100 last:border-0">
                  <td className="py-3">
                    <p className="font-medium text-neutral-900">{u.displayName}</p>
                    <p className="text-xs text-neutral-500">{u.email}</p>
                  </td>
                  <td className="py-3">
                    {editingId === u.id ? (
                      <select
                        className="text-xs border rounded px-2 py-1"
                        defaultValue={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      >
                        <option value="user">User</option>
                        <option value="contributor">Contributor</option>
                        <option value="moderator">Moderator</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[u.role] || ''}`}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <span className={`text-xs ${u.active ? 'text-green-600' : 'text-red-600'}`}>
                      {u.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-3 text-xs text-neutral-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setEditingId(editingId === u.id ? null : u.id)} className="text-xs text-primary-600 hover:text-primary-700">
                        {editingId === u.id ? 'Cancel' : 'Edit Role'}
                      </button>
                      <button
                        onClick={() => handleToggleActive(u.id, !u.active)}
                        className={`text-xs ${u.active ? 'text-red-600 hover:text-red-700' : 'text-green-600 hover:text-green-700'}`}
                      >
                        {u.active ? 'Deactivate' : 'Activate'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {meta.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: meta.totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => fetchUsers(p)}
              className={`w-8 h-8 rounded text-sm ${p === meta.page ? 'bg-primary-600 text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
