'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, ApiError, setCsrfToken } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address';
    if (!password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);

    try {
      const result = await api.login({ email: email.trim(), password });
      // Store CSRF token for cross-origin requests (Vercel → Render)
      if (result.csrfToken) {
        setCsrfToken(result.csrfToken);
      }
      setSuccess(true);
      // Redirect after brief delay so user sees success
      setTimeout(() => router.push('/account'), 800);
    } catch (err) {
      if (err instanceof ApiError) {
        setServerError(err.message);
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Welcome back</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Sign in to your EVERHERE account
      </p>

      {success && (
        <div className="p-4 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm mb-6" role="status">
          Login successful! Redirecting to your account…
        </div>
      )}

      {serverError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-700 mb-1">
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`input ${errors.email ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => { setEmail(e.target.value); if (errors.email) setErrors((p) => { const n = { ...p }; delete n.email; return n; }); }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={submitting || success}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="text-sm font-medium text-neutral-700">
              Password
            </label>
            <Link href="/forgot-password" className="text-xs text-primary-600 hover:text-primary-700">
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            className={`input ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            placeholder="Enter your password"
            value={password}
            onChange={(e) => { setPassword(e.target.value); if (errors.password) setErrors((p) => { const n = { ...p }; delete n.password; return n; }); }}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            disabled={submitting || success}
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">{errors.password}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting || success}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Signing in…
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
          Create one
        </Link>
      </p>
    </div>
  );
}
