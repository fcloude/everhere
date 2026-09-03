'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { applicationSchema, type ApplicationInput } from '@everhere/shared';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const skillOptions = [
  'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'Python',
  'PostgreSQL', 'Prisma', 'Tailwind CSS', 'UI/UX Design', 'Figma',
  'Accessibility', 'Security', 'Technical Writing', 'DevOps', 'Testing',
  'Community Management', 'Research', 'Other',
];

const roleOptions = [
  { value: 'developer', label: 'Developer' },
  { value: 'designer', label: 'Designer' },
  { value: 'researcher', label: 'Researcher' },
  { value: 'security', label: 'Security' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'tester', label: 'Tester' },
  { value: 'docs', label: 'Documentation' },
  { value: 'community', label: 'Community' },
  { value: 'other', label: 'Other' },
];

export default function ContributePage() {
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<ApplicationInput>({
    resolver: zodResolver(applicationSchema),
    defaultValues: {
      skills: [],
      portfolioLinks: [],
    },
  });

  const toggleSkill = (skill: string) => {
    const next = selectedSkills.includes(skill)
      ? selectedSkills.filter((s) => s !== skill)
      : [...selectedSkills, skill];
    setSelectedSkills(next);
    setValue('skills', next, { shouldValidate: true });
  };

  const [links, setLinks] = useState<string[]>(['']);

  const addLink = () => {
    if (links.length < 5) {
      setLinks([...links, '']);
    }
  };

  const removeLink = (index: number) => {
    const next = links.filter((_, i) => i !== index);
    setLinks(next);
    setValue('portfolioLinks', next.filter(Boolean), { shouldValidate: true });
  };

  const updateLink = (index: number, value: string) => {
    const next = [...links];
    next[index] = value;
    setLinks(next);
    setValue('portfolioLinks', next.filter(Boolean), { shouldValidate: true });
  };

  const onSubmit = async (data: ApplicationInput) => {
    setError(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/applications`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...data,
            portfolioLinks: data.portfolioLinks?.filter(Boolean) || [],
          }),
        },
      );

      const json = await res.json();
      if (!json.success) {
        setError(json.error?.message || 'Something went wrong. Please try again.');
        return;
      }

      setSubmitted(true);
    } catch {
      setError('Something went wrong. Please try again later.');
    }
  };

  return (
    <>
      <Header />
      <main id="main-content" className="py-16">
        <div className="container-narrow max-w-2xl">
          <h1 className="section-heading text-center mb-4">Apply to Contribute</h1>
          <p className="text-neutral-600 text-center mb-4">
            Tell us about yourself and how you&apos;d like to help build EVERHERE.
          </p>
          <p className="text-sm text-neutral-500 text-center mb-10">
            All profile fields are private by default. No phone number is required.
          </p>

          {submitted ? (
            <div className="card text-center py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center" aria-hidden="true">
                <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-neutral-900 mb-2">Application Submitted!</h2>
              <p className="text-neutral-600">
                Thank you for your interest in contributing. Our team will review your application
                and get back to you via email.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="card space-y-6" noValidate>
              {/* Display Name */}
              <div>
                <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700 mb-1">
                  Display Name <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <input
                  id="displayName"
                  type="text"
                  className="input"
                  placeholder="Your public display name"
                  {...register('displayName')}
                  aria-invalid={!!errors.displayName}
                  aria-describedby={errors.displayName ? 'name-error' : undefined}
                />
                {errors.displayName && (
                  <p id="name-error" className="mt-1 text-sm text-danger" role="alert">{errors.displayName.message}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="app-email" className="block text-sm font-medium text-neutral-700 mb-1">
                  Email <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <input
                  id="app-email"
                  type="email"
                  className="input"
                  placeholder="your@email.com"
                  {...register('email')}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
                {errors.email && (
                  <p id="email-error" className="mt-1 text-sm text-danger" role="alert">{errors.email.message}</p>
                )}
              </div>

              {/* Skills */}
              <div>
                <fieldset>
                  <legend className="block text-sm font-medium text-neutral-700 mb-2">
                    Skills <span className="text-danger" aria-hidden="true">*</span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {skillOptions.map((skill) => (
                      <button
                        key={skill}
                        type="button"
                        onClick={() => toggleSkill(skill)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
                          selectedSkills.includes(skill)
                            ? 'bg-primary-100 border-primary-300 text-primary-700'
                            : 'bg-white border-neutral-300 text-neutral-600 hover:border-neutral-400'
                        }`}
                        aria-pressed={selectedSkills.includes(skill)}
                      >
                        {skill}
                      </button>
                    ))}
                  </div>
                  {errors.skills && (
                    <p className="mt-1 text-sm text-danger" role="alert">{errors.skills.message}</p>
                  )}
                </fieldset>
              </div>

              {/* Custom Skill */}
              <div>
                <label htmlFor="customSkill" className="block text-sm font-medium text-neutral-700 mb-1">
                  Other Skill <span className="text-neutral-400">(optional)</span>
                </label>
                <input
                  id="customSkill"
                  type="text"
                  className="input"
                  placeholder="Skill not listed above"
                  {...register('customSkill')}
                />
              </div>

              {/* Preferred Role */}
              <div>
                <label htmlFor="preferredRole" className="block text-sm font-medium text-neutral-700 mb-1">
                  Preferred Role <span className="text-danger" aria-hidden="true">*</span>
                </label>
                <select
                  id="preferredRole"
                  className="input"
                  {...register('preferredRole')}
                  aria-invalid={!!errors.preferredRole}
                  aria-describedby={errors.preferredRole ? 'role-error' : undefined}
                >
                  <option value="">Select a role</option>
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {errors.preferredRole && (
                  <p id="role-error" className="mt-1 text-sm text-danger" role="alert">{errors.preferredRole.message}</p>
                )}
              </div>

              {/* Portfolio Links */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Portfolio / GitHub Links <span className="text-neutral-400">(optional, max 5)</span>
                </label>
                <div className="space-y-2">
                  {links.map((link, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        type="url"
                        className="input flex-1"
                        placeholder="https://github.com/yourname"
                        value={link}
                        onChange={(e) => updateLink(i, e.target.value)}
                      />
                      {links.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeLink(i)}
                          className="px-3 py-2 rounded-lg text-neutral-400 hover:text-danger hover:bg-red-50 transition-colors"
                          aria-label={`Remove link ${i + 1}`}
                        >
                          ✕
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                {links.length < 5 && (
                  <button
                    type="button"
                    onClick={addLink}
                    className="mt-2 text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    + Add another link
                  </button>
                )}
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-neutral-700 mb-1">
                  Message <span className="text-neutral-400">(optional)</span>
                </label>
                <textarea
                  id="message"
                  className="input min-h-[80px]"
                  placeholder="Anything else you'd like us to know?"
                  {...register('message')}
                />
              </div>

              {/* Consent */}
              <div className="flex items-start gap-3">
                <input
                  id="consent"
                  type="checkbox"
                  className="mt-1 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                  {...register('consent')}
                  aria-invalid={!!errors.consent}
                  aria-describedby={errors.consent ? 'consent-error' : undefined}
                />
                <label htmlFor="consent" className="text-sm text-neutral-600">
                  I understand that my information will be used for the purpose of reviewing my
                  application and managing my contributor profile. I have read the{' '}
                  <a href="/privacy" className="text-primary-600 hover:underline">Privacy Policy</a>.
                  <span className="text-danger" aria-hidden="true"> *</span>
                </label>
              </div>
              {errors.consent && (
                <p id="consent-error" className="text-sm text-danger" role="alert">{errors.consent.message}</p>
              )}

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
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </button>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
