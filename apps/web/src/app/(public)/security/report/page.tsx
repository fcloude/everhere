'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { securityReportSchema, type SecurityReportInput } from '@everhere/shared';
import { apiFetch, ApiError } from '@/lib/api';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const severities = [
  { value: 'low', label: 'Low — Minor issue, no immediate risk' },
  { value: 'medium', label: 'Medium — Could be exploited with some effort' },
  { value: 'high', label: 'High — Exploitable with moderate access or impact' },
  { value: 'critical', label: 'Critical — Immediate, severe impact' },
];

export default function SecurityReportPage() {
  const [submitted, setSubmitted] = useState(false);
  const [reportId, setReportId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SecurityReportInput>({
    resolver: zodResolver(securityReportSchema),
  });

  const onSubmit = async (data: SecurityReportInput) => {
    setError(null);
    try {
      const result = await apiFetch<{ reportId?: string; message: string }>('/security-reports', { method: 'POST', body: data });
      setReportId(result.reportId || null);
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
          <h1 className="section-heading text-center mb-4">Report a Security Issue</h1>
          <p className="text-neutral-600 text-center mb-4">
            Found a security vulnerability? We take responsible disclosure seriously.
          </p>
          <p className="text-sm text-neutral-500 text-center mb-10">
            Reports are confidential and access is restricted to security reviewers.
            You will receive an acknowledgment email if you provide a contact address.
          </p>

          {submitted ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center" aria-hidden="true">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Report Received</h2>
              <p className="text-neutral-600 mb-2">
                Thank you for your responsible disclosure. We will review it promptly.
              </p>
              {reportId && (
                <p className="text-sm text-neutral-500">
                  Reference ID: <code className="bg-neutral-100 px-2 py-1 rounded">{reportId}</code>
                </p>
              )}
              <p className="text-sm text-neutral-500 mt-4">
                If you provided a contact email, you will receive an acknowledgment shortly.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6" noValidate>
              {/* Honeypot */}
              <div className="absolute opacity-0 h-0 overflow-hidden" aria-hidden="true">
                <label htmlFor="website-report">Website</label>
                <input id="website-report" type="text" tabIndex={-1} autoComplete="off" {...register('website')} />
              </div>

              {/* Title */}
              <div>
                <label htmlFor="report-title" className="block text-sm font-medium text-neutral-700 mb-1">
                  Title <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <input
                  id="report-title"
                  type="text"
                  className="input"
                  placeholder="Brief summary of the vulnerability"
                  {...register('title')}
                  aria-invalid={!!errors.title}
                  aria-describedby={errors.title ? 'report-title-error' : undefined}
                />
                {errors.title && (
                  <p id="report-title-error" className="mt-1 text-sm text-danger" role="alert">{errors.title.message}</p>
                )}
              </div>

              {/* Severity */}
              <div>
                <label htmlFor="severity" className="block text-sm font-medium text-neutral-700 mb-1">
                  Severity Estimate <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <select
                  id="severity"
                  className="input"
                  {...register('severity')}
                  aria-invalid={!!errors.severity}
                  aria-describedby={errors.severity ? 'severity-error' : undefined}
                >
                  <option value="">Estimate severity</option>
                  {severities.map((s) => (
                    <option key={s.value} value={s.value}>{s.label}</option>
                  ))}
                </select>
                {errors.severity && (
                  <p id="severity-error" className="mt-1 text-sm text-danger" role="alert">{errors.severity.message}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label htmlFor="report-description" className="block text-sm font-medium text-neutral-700 mb-1">
                  Description <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <textarea
                  id="report-description"
                  className="input min-h-[150px]"
                  placeholder="Please describe the vulnerability, affected component, and potential impact"
                  {...register('description')}
                  aria-invalid={!!errors.description}
                  aria-describedby={errors.description ? 'report-desc-error' : undefined}
                />
                {errors.description && (
                  <p id="report-desc-error" className="mt-1 text-sm text-danger" role="alert">{errors.description.message}</p>
                )}
              </div>

              {/* Proof of Concept URL (optional) */}
              <div>
                <label htmlFor="poc" className="block text-sm font-medium text-neutral-700 mb-1">
                  Proof of Concept Link <span className="text-neutral-400">(optional)</span>
                </label>
                <input
                  id="poc"
                  type="url"
                  className="input"
                  placeholder="https://... (link to PoC, not a file upload)"
                  {...register('proofOfConcept')}
                  aria-invalid={!!errors.proofOfConcept}
                  aria-describedby={errors.proofOfConcept ? 'poc-error' : undefined}
                />
                {errors.proofOfConcept && (
                  <p id="poc-error" className="mt-1 text-sm text-danger" role="alert">{errors.proofOfConcept.message}</p>
                )}
              </div>

              {/* Contact Email (optional) */}
              <div>
                <label htmlFor="contact-email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Contact Email <span className="text-neutral-400">(optional, for follow-up)</span>
                </label>
                <input
                  id="contact-email"
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  {...register('contactEmail')}
                  aria-invalid={!!errors.contactEmail}
                  aria-describedby={errors.contactEmail ? 'contact-error' : undefined}
                />
                {errors.contactEmail && (
                  <p id="contact-error" className="mt-1 text-sm text-danger" role="alert">{errors.contactEmail.message}</p>
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
                {isSubmitting ? 'Submitting...' : 'Submit Security Report'}
              </button>

              <p className="text-xs text-neutral-400 text-center">
                This form is rate-limited. All submissions are logged for security accountability.
              </p>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
