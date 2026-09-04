import argon2 from 'argon2';
import { prisma } from './db/client';
import { logger } from './index';

export async function autoSeed() {
  try {
    logger.info('🌱 Running auto-seed...');

    // ── Create admin user ──────────────────────────────────
    const adminPassword = process.env.ADMIN_SEED_PASSWORD || 'ChangeMeImmediately123!';
    const adminHash = await argon2.hash(adminPassword);

    const admin = await prisma.user.upsert({
      where: { email: 'admin@everhere.org' },
      update: {},
      create: {
        email: 'admin@everhere.org',
        displayName: 'EVERHERE Admin',
        passwordHash: adminHash,
        role: 'admin',
        emailVerified: true,
        active: true,
      },
    });
    logger.info({ email: admin.email, id: admin.id }, '✓ Admin user ready');

    // ── Default skills ─────────────────────────────────────
    const defaultSkills = [
      'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'Python',
      'PostgreSQL', 'Prisma', 'Tailwind CSS', 'UI/UX Design', 'Figma',
      'Accessibility', 'Security', 'Technical Writing', 'DevOps', 'Testing',
      'Community Management', 'Research',
    ];

    for (const skillName of defaultSkills) {
      await prisma.skill.upsert({
        where: { name: skillName },
        update: {},
        create: { name: skillName },
      });
    }
    logger.info({ count: defaultSkills.length }, '✓ Default skills ready');

    // ── Default community links ────────────────────────────
    const defaultLinks = [
      { platform: 'reddit', url: 'https://reddit.com/r/everhere_official', label: 'Reddit', order: 0 },
      { platform: 'telegram', url: 'https://t.me/everheregroup', label: 'Telegram', order: 1 },
      { platform: 'whatsapp', url: 'https://chat.whatsapp.com/Claz8fIeFxl3DKpVboO1fv', label: 'WhatsApp', order: 2 },
    ];

    for (const link of defaultLinks) {
      const existing = await prisma.communityLink.findFirst({ where: { platform: link.platform } });
      if (!existing) {
        await prisma.communityLink.create({ data: { ...link, enabled: true } });
      }
    }
    logger.info({ count: defaultLinks.length }, '✓ Default community links ready');

    logger.info('✨ Auto-seed complete!');
  } catch (error) {
    logger.error({ error }, 'Auto-seed failed (non-fatal, server will still start)');
  }
}
