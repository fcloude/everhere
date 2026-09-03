import { z } from 'zod';
import { FEEDBACK_CATEGORIES, REPORT_SEVERITY } from '../constants';

const feedbackCategoriesValues = Object.values(FEEDBACK_CATEGORIES) as [string, ...string[]];
const reportSeverityValues = Object.values(REPORT_SEVERITY) as [string, ...string[]];

export const feedbackSchema = z.object({
  category: z.enum(feedbackCategoriesValues, {
    errorMap: () => ({ message: 'Please select a category' }),
  }),
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(5000, 'Description must be at most 5000 characters'),
  email: z.string().email('Please enter a valid email address').optional(),
  // Honeypot — should be empty
  website: z.string().max(0).optional(),
});

export type FeedbackInput = z.infer<typeof feedbackSchema>;

export const securityReportSchema = z.object({
  title: z
    .string()
    .min(5, 'Title must be at least 5 characters')
    .max(200, 'Title must be at most 200 characters'),
  description: z
    .string()
    .min(20, 'Description must be at least 20 characters')
    .max(10000, 'Description must be at most 10000 characters'),
  severity: z.enum(reportSeverityValues, {
    errorMap: () => ({ message: 'Please estimate the severity' }),
  }),
  proofOfConcept: z
    .string()
    .url('Please enter a valid URL')
    .max(2000)
    .optional(),
  contactEmail: z.string().email('Please enter a valid email').optional(),
  // Honeypot
  website: z.string().max(0).optional(),
});

export type SecurityReportInput = z.infer<typeof securityReportSchema>;

export const feedbackModerationSchema = z.object({
  feedbackId: z.string().uuid(),
  status: z.enum(['in-review', 'resolved', 'wontfix']),
  internalNotes: z.string().max(2000).optional(),
});

export type FeedbackModerationInput = z.infer<typeof feedbackModerationSchema>;
