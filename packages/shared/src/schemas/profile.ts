import { z } from 'zod';

export const profileUpdateSchema = z.object({
  bio: z.string().max(1000, 'Bio must be at most 1000 characters').optional(),
  skills: z.array(z.string()).max(10).optional(),
  portfolioLinks: z
    .array(z.string().url('Please enter a valid URL'))
    .max(5, 'You can add at most 5 links')
    .optional(),
  preferredRole: z.string().optional(),
});

export type ProfileUpdateInput = z.infer<typeof profileUpdateSchema>;

export const visibilityUpdateSchema = z.object({
  showBio: z.boolean().optional(),
  showSkills: z.boolean().optional(),
  showLinks: z.boolean().optional(),
});

export type VisibilityUpdateInput = z.infer<typeof visibilityUpdateSchema>;
