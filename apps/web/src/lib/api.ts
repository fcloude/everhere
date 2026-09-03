import type { ApiResponse } from '@everhere/shared';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

// ── Typed fetch wrapper ───────────────────────────────────

class ApiError extends Error {
  public readonly code: string;
  public readonly statusCode: number;

  constructor(message: string, code: string, statusCode: number) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.name = 'ApiError';
  }
}

interface ApiFetchOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
}

export async function apiFetch<T>(
  path: string,
  options: ApiFetchOptions = {},
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const fetchHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };

  // Add CSRF token for state-changing requests
  if (method !== 'GET' && method !== 'HEAD') {
    const csrfToken = getCsrfToken();
    if (csrfToken) {
      fetchHeaders['X-CSRF-Token'] = csrfToken;
    }
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: fetchHeaders,
    body: body ? JSON.stringify(body) : undefined,
    credentials: 'include', // Include cookies for session
  });

  const json: ApiResponse<T> = await res.json();

  if (!json.success || !json.data) {
    throw new ApiError(
      json.error?.message || 'An unexpected error occurred',
      json.error?.code || 'UNKNOWN_ERROR',
      res.status,
    );
  }

  return json.data as T;
}

// ── CSRF token helper ────────────────────────────────────

function getCsrfToken(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/csrf_token=([^;]+)/);
  return match ? match[1] : null;
}

export { ApiError };

// ── Specific API calls ───────────────────────────────────

export interface MeData {
  id: string;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
  createdAt: string;
  profile: {
    bio: string | null;
    preferredRole: string;
    portfolioLinks: string[];
    skills: string[];
    visibility: {
      showBio: boolean;
      showSkills: boolean;
      showLinks: boolean;
    };
  } | null;
}

export interface ProfileUpdateData {
  bio?: string;
  skills?: string[];
  portfolioLinks?: string[];
  preferredRole?: string;
}

export interface VisibilityUpdateData {
  showBio?: boolean;
  showSkills?: boolean;
  showLinks?: boolean;
}

export interface ContributionData {
  id: string;
  title: string;
  description: string | null;
  url: string;
  status: string;
  tags: { id: string; name: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface LoginData {
  user: { id: string; email: string; displayName: string; role: string };
  csrfToken: string;
}

export interface PublicContributor {
  id: string;
  displayName: string;
  role: string;
  bio?: string;
  skills?: string[];
  portfolioLinks?: string[];
}

// ── Moderator types ────────────────────────────────────
export interface ModQueue {
  contributions: (ContributionData & { user: { id: string; displayName: string } })[];
  tags: { id: string; name: string; createdAt: string }[];
  feedback: { id: string; category: string; title: string; description: string; email: string | null; status: string; createdAt: string }[];
  flags: { id: string; reason: string; resolved: boolean; flaggedUser: { id: string; displayName: string; email: string }; flaggedByMod: { id: string; displayName: string }; createdAt: string }[];
}

// ── Admin types ─────────────────────────────────────────
export interface AdminUser {
  id: string; email: string; displayName: string; role: string; active: boolean;
  emailVerified: boolean; mfaEnabled: boolean; createdAt: string; updatedAt: string;
}

export interface AdminApplication {
  id: string; displayName: string; email: string; skills: string[]; preferredRole: string;
  portfolioLinks: string[]; message: string | null; status: string; reviewerNotes: string | null;
  createdAt: string; updatedAt: string;
}

export interface AuditLogEntry {
  id: string; actor: string; actorEmail: string; action: string; targetType: string;
  targetId: string | null; before: Record<string, unknown> | null; after: Record<string, unknown> | null;
  createdAt: string;
}

export interface SecurityReportData {
  id: string; title: string; description: string; severity: string; proofOfConcept: string | null;
  contactEmail: string | null; status: string; internalNotes: string | null; createdAt: string;
}

export interface PaginatedData<T> {
  data: T[];
  meta: { page: number; limit: number; total: number; totalPages: number };
}

export const api = {
  // ── Auth ───────────────────────────────────────────────
  login: (data: { email: string; password: string }) =>
    apiFetch<LoginData>('/auth/login', { method: 'POST', body: data }),

  register: (data: { displayName: string; email: string; password: string; confirmPassword: string }) =>
    apiFetch<{ message: string }>('/auth/register', { method: 'POST', body: data }),

  logout: () =>
    apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }),

  forgotPassword: (data: { email: string }) =>
    apiFetch<{ message: string }>('/auth/password-reset/request', { method: 'POST', body: data }),

  resetPassword: (data: { token: string; password: string; confirmPassword: string }) =>
    apiFetch<{ message: string }>('/auth/password-reset/confirm', { method: 'POST', body: data }),

  verifyEmail: (token: string) =>
    apiFetch<{ message: string }>('/auth/verify-email', { method: 'POST', body: { token } }),

  // ── Profile ────────────────────────────────────────────
  getMe: () => apiFetch<MeData>('/me'),

  updateProfile: (data: ProfileUpdateData) =>
    apiFetch<{ message: string }>('/me/profile', { method: 'PATCH', body: data }),

  updateVisibility: (data: VisibilityUpdateData) =>
    apiFetch<{ message: string }>('/me/visibility', { method: 'PATCH', body: data }),

  // ── Contributions ──────────────────────────────────────
  getMyContributions: () =>
    apiFetch<ContributionData[]>('/contributions/mine'),

  submitContribution: (data: { title: string; description?: string; url: string; tagIds?: string[] }) =>
    apiFetch<{ id: string; status: string; message: string }>('/contributions', { method: 'POST', body: data }),

  getPublicContributions: (page = 1, limit = 20) =>
    apiFetch<ContributionData[]>(`/contributions/public?page=${page}&limit=${limit}`),

  // ── Contributors ───────────────────────────────────────
  getPublicContributors: (page = 1, limit = 20) =>
    apiFetch<PublicContributor[]>(`/me/public?page=${page}&limit=${limit}`),

  // ── Applications ───────────────────────────────────────
  submitApplication: (data: Record<string, unknown>) =>
    apiFetch<{ message: string }>('/applications', { method: 'POST', body: data }),

  // ── Moderator ──────────────────────────────────────────
  getModQueue: () =>
    apiFetch<ModQueue>('/mod/queue'),

  moderateContribution: (id: string, decision: 'approved' | 'rejected', reason?: string) =>
    apiFetch<{ message: string }>(`/mod/contributions/${id}/decision`, { method: 'POST', body: { decision, reason } }),

  moderateFeedback: (id: string, status: string, internalNotes?: string) =>
    apiFetch<{ message: string }>(`/mod/feedback/${id}/status`, { method: 'POST', body: { status, internalNotes } }),

  approveTag: (id: string) =>
    apiFetch<{ message: string }>(`/mod/tags/${id}/approve`, { method: 'POST' }),

  resolveFlag: (id: string) =>
    apiFetch<{ message: string }>(`/mod/flags/${id}/resolve`, { method: 'POST' }),

  // ── Admin ──────────────────────────────────────────────
  getAdminUsers: (page = 1, limit = 20, role?: string, q?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (role) params.set('role', role);
    if (q) params.set('q', q);
    return apiFetch<PaginatedData<AdminUser>>(`/admin/users?${params}`);
  },

  changeUserRole: (id: string, role: string, confirmationToken?: string) =>
    apiFetch<{ message: string; requiresConfirmation?: boolean; targetUser?: { id: string; displayName: string; currentRole: string }; proposedRole?: string }>(`/admin/users/${id}/role`, { method: 'PATCH', body: { role, confirmationToken } }),

  toggleUserActive: (id: string, active: boolean, confirmationToken?: string) =>
    apiFetch<{ message: string; requiresConfirmation?: boolean }>(`/admin/users/${id}/active`, { method: 'PATCH', body: { active, confirmationToken } }),

  getAdminApplications: (page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    return apiFetch<PaginatedData<AdminApplication>>(`/admin/applications?${params}`);
  },

  reviewApplication: (id: string, decision: 'approved' | 'rejected', notes?: string) =>
    apiFetch<{ message: string }>(`/admin/applications/${id}/review`, { method: 'POST', body: { decision, notes } }),

  getAuditLogs: (page = 1, limit = 50, filters?: { action?: string; targetType?: string; actorId?: string }) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (filters?.action) params.set('action', filters.action);
    if (filters?.targetType) params.set('targetType', filters.targetType);
    if (filters?.actorId) params.set('actorId', filters.actorId);
    return apiFetch<PaginatedData<AuditLogEntry>>(`/admin/audit-logs?${params}`);
  },

  getSecurityReports: (page = 1, limit = 20, status?: string, severity?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    if (severity) params.set('severity', severity);
    return apiFetch<PaginatedData<SecurityReportData>>(`/admin/security-reports?${params}`);
  },

  getAdminContributions: (page = 1, limit = 20, status?: string) => {
    const params = new URLSearchParams({ page: String(page), limit: String(limit) });
    if (status) params.set('status', status);
    return apiFetch<PaginatedData<ContributionData>>(`/admin/contributions?${params}`);
  },
};
