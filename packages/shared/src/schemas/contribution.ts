import { z } from 'zod';

export const contributionSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .max(2000, 'Description must be at most 2000 characters')
    .optional(),
  url: z
    .string()
    .url('Please enter a valid URL')
    .refine(
      (url) => {
        try {
          const parsed = new URL(url);
          return ['http:', 'https:'].includes(parsed.protocol);
        } catch {
          return false;
        }
      },
      { message: 'Please enter a valid HTTP/HTTPS URL' },
    ),
  tagIds: z.array(z.string().uuid()).max(5, 'You can add at most 5 tags').optional(),
});

export type ContributionInput = z.infer<typeof contributionSchema>;

export const contributionModerationSchema = z.object({
  contributionId: z.string().uuid(),
  decision: z.enum(['approved', 'rejected']),
  reason: z.string().max(2000).optional(),
});

export type ContributionModerationInput = z.infer<typeof contributionModerationSchema>;
