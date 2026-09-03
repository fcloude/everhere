import type { Request } from 'express';
import { prisma } from '../db/client';

interface AuditEntry {
  actorId: string;
  action: string;
  targetType: string;
  targetId?: string;
  before?: Record<string, unknown>;
  after?: Record<string, unknown>;
  req?: Request;
}

function hashIp(ip: string | undefined): string | undefined {
  if (!ip) return undefined;
  // Simple hash — in production use a proper HMAC with a secret
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(ip).digest('hex').slice(0, 16);
}

export async function writeAuditLog(entry: AuditEntry) {
  try {
    const ipHash = entry.req
      ? hashIp(
          (entry.req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ||
            entry.req.ip,
        )
      : undefined;

    await prisma.auditLog.create({
      data: {
        actorId: entry.actorId,
        action: entry.action,
        targetType: entry.targetType,
        targetId: entry.targetId,
        before: entry.before ?? undefined,
        after: entry.after ?? undefined,
        ipHash,
      },
    });
  } catch (error) {
    // Audit logging should never crash the request
    console.error('Failed to write audit log:', error);
  }
}
