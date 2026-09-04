import { z } from 'zod';
import { PREFERRED_ROLES } from '../constants';

const preferredRolesValues = Object.values(PREFERRED_ROLES) as [string, ...string[]];

export const applicationSchema = z.object({
  displayName: z
    .string()
    .min(2, 'Display name must be at least 2 characters')
    .max(50, 'Display name must be at most 50 characters'),
  email: z.string().email('Please enter a valid email address'),
  skills: z
    .array(z.string())
    .min(1, 'Please select at least one skill')
    .max(10, 'You can select at most 10 skills'),
  customSkill: z.string().max(50, 'Custom skill must be at most 50 characters').optional(),
  preferredRole: z.enum(preferredRolesValues, {
    errorMap: () => ({ message: 'Please select a preferred role' }),
  }),
  portfolioLinks: z
    .array(
      z.string().refine(
        (url) => /^https?:\/\//.test(url),
        { message: 'Please enter a valid HTTP/HTTPS URL' },
      ),
    )
    .max(5, 'You can add at most 5 links')
    .optional(),
  message: z.string().max(2000, 'Message must be at most 2000 characters').optional(),
  consent: z.literal(true, {
    errorMap: () => ({ message: 'You must agree to the data usage policy' }),
  }),
});

export type ApplicationInput = z.infer<typeof applicationSchema>;

export const applicationReviewSchema = z.object({
  applicationId: z.string().uuid(),
  decision: z.enum(['approved', 'rejected']),
  notes: z.string().max(2000).optional(),
});

export type ApplicationReviewInput = z.infer<typeof applicationReviewSchema>;
