import { Router } from 'express';
import { prisma } from '../db/client';
import { requireAuth, requireRole, requireAuthAndCsrf } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { profileUpdateSchema, visibilityUpdateSchema } from '@everhere/shared';

const router = Router();

// ── GET /me ──────────────────────────────────────────────
// Any authenticated user: own profile with private fields
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const user = (req as any).user;

    const profile = await prisma.contributorProfile.findUnique({
      where: { userId: user.id },
      include: { skills: { include: { skill: true } } },
    });

    res.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        emailVerified: user.emailVerified,
        mfaEnabled: user.mfaEnabled,
        createdAt: user.createdAt,
        profile: profile
          ? {
              bio: profile.bio,
              preferredRole: profile.preferredRole,
              portfolioLinks: profile.portfolioLinks,
              skills: profile.skills.map((s) => s.skill.name),
              visibility: {
                showBio: profile.showBio,
                showSkills: profile.showSkills,
                showLinks: profile.showLinks,
              },
            }
          : null,
      },
    });
  } catch (error) {
    next(error);
  }
});

// ── PATCH /me/profile ────────────────────────────────────
// Contributor+ only: update profile fields
router.patch(
  '/profile',
  requireAuthAndCsrf,
  requireRole('contributor'),
  validate(profileUpdateSchema),
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      const { bio, skills, portfolioLinks, preferredRole } = req.body;

      // Upsert profile
      const profile = await prisma.contributorProfile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          bio,
          preferredRole: preferredRole as any,
          portfolioLinks: portfolioLinks || [],
        },
        update: {
          bio,
          ...(preferredRole && { preferredRole: preferredRole as any }),
          ...(portfolioLinks && { portfolioLinks }),
        },
      });

      // Update skills if provided
      if (skills !== undefined) {
        // Remove existing skills
        await prisma.userSkill.deleteMany({ where: { userId: user.id } });

        // Add new skills (find or create each skill)
        for (const skillName of skills) {
          const skill = await prisma.skill.upsert({
            where: { name: skillName },
            create: { name: skillName },
            update: {},
          });
          await prisma.userSkill.create({
            data: { userId: user.id, skillId: skill.id },
          });
        }
      }

      res.json({
        success: true,
        data: { message: 'Profile updated.' },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ── PATCH /me/visibility ─────────────────────────────────
// Contributor+ only: toggle public/private field visibility
router.patch(
  '/visibility',
  requireAuthAndCsrf,
  requireRole('contributor'),
  validate(visibilityUpdateSchema),
  async (req, res, next) => {
    try {
      const user = (req as any).user;
      const { showBio, showSkills, showLinks } = req.body;

      // Ensure profile exists
      await prisma.contributorProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });

      await prisma.contributorProfile.update({
        where: { userId: user.id },
        data: {
          ...(showBio !== undefined && { showBio }),
          ...(showSkills !== undefined && { showSkills }),
          ...(showLinks !== undefined && { showLinks }),
        },
      });

      res.json({
        success: true,
        data: { message: 'Visibility updated.' },
      });
    } catch (error) {
      next(error);
    }
  },
);

// ── GET /me/public/:userId ───────────────────────────────
// Public: contributor profile (only public fields)
router.get('/public/:userId', async (req, res, next) => {
  try {
    const { userId } = req.params;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, displayName: true, role: true, createdAt: true },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Contributor not found.' },
      });
    }

    const profile = await prisma.contributorProfile.findUnique({
      where: { userId },
      include: { skills: { include: { skill: true } } },
    });

    // Only return fields the contributor has made public
    const publicProfile: Record<string, unknown> = {
      id: user.id,
      displayName: user.displayName,
      role: user.role,
    };

    if (profile?.showBio && profile.bio) {
      publicProfile.bio = profile.bio;
    }
    if (profile?.showSkills) {
      publicProfile.skills = profile.skills.map((s) => s.skill.name);
    }
    if (profile?.showLinks && profile.portfolioLinks.length > 0) {
      publicProfile.portfolioLinks = profile.portfolioLinks;
    }

    res.json({ success: true, data: publicProfile });
  } catch (error) {
    next(error);
  }
});

export default router;
