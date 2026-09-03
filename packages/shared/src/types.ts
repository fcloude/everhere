import type { RoleName, PreferredRole } from './constants';

// API response envelope
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Public user (safe to send to client)
export interface PublicUser {
  id: string;
  displayName: string;
  role: RoleName;
  createdAt: string;
}

// Full user (only for the user themselves or admins)
export interface PrivateUser extends PublicUser {
  email: string;
  phone?: string;
  emailVerified: boolean;
  mfaEnabled: boolean;
}

// Contributor profile
export interface ContributorProfile {
  id: string;
  userId: string;
  bio?: string;
  skills: string[];
  preferredRole: PreferredRole;
  portfolioLinks: string[];
  // Visibility controls
  showBio: boolean;
  showSkills: boolean;
  showLinks: boolean;
}

// Session info
export interface SessionInfo {
  id: string;
  userId: string;
  expiresAt: string;
  createdAt: string;
  ipHash?: string;
  userAgent?: string;
  lastActiveAt: string;
}

// Audit log entry
export interface AuditLogEntry {
  id: string;
  actorId: string;
  actorEmail?: string;
  action: string;
  targetType: string;
  targetId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  ipHash?: string;
  createdAt: string;
}

// Pagination params
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// Search/filter params
export interface SearchParams extends PaginationParams {
  q?: string;
  status?: string;
  role?: string;
}
