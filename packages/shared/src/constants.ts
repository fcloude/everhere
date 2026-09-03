// Roles
export const ROLES = {
  VISITOR: 'visitor',
  USER: 'user',
  CONTRIBUTOR: 'contributor',
  MODERATOR: 'moderator',
  ADMIN: 'admin',
} as const;

export type RoleName = (typeof ROLES)[keyof typeof ROLES];

// Application statuses
export const APPLICATION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  ACTIVATED: 'activated',
} as const;

export type ApplicationStatus =
  (typeof APPLICATION_STATUS)[keyof typeof APPLICATION_STATUS];

// Contribution statuses
export const CONTRIBUTION_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
} as const;

export type ContributionStatus =
  (typeof CONTRIBUTION_STATUS)[keyof typeof CONTRIBUTION_STATUS];

// Feedback statuses
export const FEEDBACK_STATUS = {
  NEW: 'new',
  IN_REVIEW: 'in-review',
  RESOLVED: 'resolved',
  WONTFIX: 'wontfix',
} as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUS)[keyof typeof FEEDBACK_STATUS];

// Feedback categories
export const FEEDBACK_CATEGORIES = {
  GENERAL: 'general',
  BUG: 'bug',
  FEATURE_REQUEST: 'feature-request',
  WEBSITE_ISSUE: 'website-issue',
  COMMUNITY_ISSUE: 'community-issue',
  OTHER: 'other',
} as const;

export type FeedbackCategory = (typeof FEEDBACK_CATEGORIES)[keyof typeof FEEDBACK_CATEGORIES];

// Security report severity
export const REPORT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
} as const;

export type ReportSeverity = (typeof REPORT_SEVERITY)[keyof typeof REPORT_SEVERITY];

// Preferred contributor roles
export const PREFERRED_ROLES = {
  DEVELOPER: 'developer',
  DESIGNER: 'designer',
  RESEARCHER: 'researcher',
  SECURITY: 'security',
  MODERATOR: 'moderator',
  TESTER: 'tester',
  DOCS: 'docs',
  COMMUNITY: 'community',
  OTHER: 'other',
} as const;

export type PreferredRole = (typeof PREFERRED_ROLES)[keyof typeof PREFERRED_ROLES];

// Password constraints
export const PASSWORD_MIN_LENGTH = 12;
export const PASSWORD_MAX_LENGTH = 128;

// Rate limit windows (ms)
export const RATE_LIMITS = {
  LOGIN: { windowMs: 15 * 60 * 1000, max: 5 }, // 5 per 15 min
  REGISTER: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
  APPLICATION: { windowMs: 60 * 60 * 1000, max: 2 }, // 2 per hour
  FEEDBACK: { windowMs: 60 * 60 * 1000, max: 5 }, // 5 per hour
  SECURITY_REPORT: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
  PASSWORD_RESET: { windowMs: 60 * 60 * 1000, max: 3 }, // 3 per hour
} as const;
