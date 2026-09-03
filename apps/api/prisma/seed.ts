import { PrismaClient } from '@prisma/client';
import argon2 from 'argon2';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

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
  console.log(`  ✓ Admin user: ${admin.email} (id: ${admin.id})`);

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
  console.log(`  ✓ ${defaultSkills.length} default skills created`);

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
  console.log(`  ✓ ${defaultLinks.length} default community links created`);

  console.log('\n✨ Seed complete!');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
