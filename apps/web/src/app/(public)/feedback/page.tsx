'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { feedbackSchema, type FeedbackInput } from '@everhere/shared';
import { apiFetch, ApiError } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const categories = [
  { value: 'general', label: 'General Feedback' },
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature-request', label: 'Feature Request' },
  { value: 'website-issue', label: 'Website Issue' },
  { value: 'community-issue', label: 'Community Issue' },
  { value: 'other', label: 'Other' },
];

export default function FeedbackPage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FeedbackInput>({
    resolver: zodResolver(feedbackSchema),
  });

  const onSubmit = async (data: FeedbackInput) => {
    setError(null);
    try {
      await apiFetch<{ message: string }>('/feedback', { method: 'POST', body: data });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Something went wrong. Please try again later.');
    }
  };

  return (
    <>
      <Header />
      <main id="main-content" className="py-16">
        <div className="container-narrow max-w-2xl">
          <h1 className="section-heading text-center mb-4">Send Feedback</h1>
          <p className="text-neutral-600 text-center mb-10">
            Help us improve EVERHERE. Your feedback is valuable — anonymous submissions welcome.
          </p>

          {submitted ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center" aria-hidden="true">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Thank You!</h2>
              <p className="text-neutral-600">Your feedback has been submitted. We appreciate you taking the time.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6" noValidate>
              {/* Honeypot — hidden from humans */}
              <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website">Website</label>
                <input id="website" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
              </div>

              {/* Category */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-neutral-700 mb-1">
                  Category <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <select
                  id="category"
                  className="input"
                  {...register('category')}
                  aria-invalid={!!errors.category}
                  aria-describedby={errors.category ? 'category-error' : undefined}
                >
                  <option value="">Select a category</option>
                  {categories.map((cat) => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
                {errors.category && (
                  <p id="category-error" className="mt-1 text-sm text-danger" role="alert">{errors.category.message}</p>
                )}
              </div>

              {/* Title */}
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-neutral-700 mb-1">
                  Title <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  className="input"
                  placeholder="Brief summary of your feedback"
                  {...register('title')}
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? 'title-error' : undefined}
                />
                {errors.title && (
                  <p id="title-error" className="mt-1 text-sm text-danger" role="alert">{errors.title.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-neutral-700 mb-1">
                  Description <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="description"
                  className="input min-h-[120px]"
                  placeholder="Please describe your feedback in detail"
                  {...register('description')}
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? 'description-error' : undefined}
                />
                {errors.description && (
                  <p id="description-error" className="mt-1 text-sm text-danger" role="alert">{errors.description.message}</p>
                )}
              </div>

              {/* Email (optional) */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Contact Email <span className="text-neutral-400">(optional)</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className="input"
                  placeholder="If you'd like us to follow up"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-danger" role="alert">{errors.email.message}</p>
                )}
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
              </button>

              <p className="text-xs text-neutral-400 text-center">
                Rate limited to prevent spam. Anonymous submissions welcome.
              </p>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
