'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api, ApiError } from '@/lib/api';
import { PASSWORD_MIN_LENGTH } from '@everhere/shared';

export default function RegisterPage() {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!displayName.trim()) errs.displayName = 'Display name is required';
    else if (displayName.trim().length < 2) errs.displayName = 'Display name must be at least 2 characters';
    else if (displayName.trim().length > 50) errs.displayName = 'Display name must be at most 50 characters';

    if (!email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Please enter a valid email address';

    if (!password) errs.password = 'Password is required';
    else if (password.length < PASSWORD_MIN_LENGTH) errs.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;

    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const clearError = (field: string) => {
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    setServerError(null);

    try {
      await api.register({
        displayName: displayName.trim(),
        email: email.trim(),
        password,
        confirmPassword,
      });
      setSuccess(true);
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

  if (success) {
    return (
      <div className="card text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-100 flex items-center justify-center" aria-hidden="true">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Check your email</h1>
        <p className="text-sm text-neutral-500 mb-6">
          We&apos;ve sent a verification link to <strong>{email}</strong>.
          Please click the link to activate your account.
        </p>
        <p className="text-xs text-neutral-400 mb-6">
          Didn&apos;t receive it? Check your spam folder, or{' '}
          <button
            onClick={() => { setSuccess(false); setServerError(null); }}
            className="text-primary-600 hover:text-primary-700"
          >
            try a different email
          </button>.
        </p>
        <Link href="/login" className="btn-primary">
          Go to Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Create your account</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Join the EVERHERE community
      </p>

      {serverError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6" role="alert">
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {/* Display Name */}
        <div>
          <label htmlFor="displayName" className="block text-sm font-medium text-neutral-700 mb-1">
            Display name
          </label>
          <input
            id="displayName"
            type="text"
            autoComplete="name"
            className={`input ${errors.displayName ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            placeholder="How you'd like to be known"
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); clearError('displayName'); }}
            aria-invalid={!!errors.displayName}
            aria-describedby={errors.displayName ? 'displayName-error' : undefined}
            disabled={submitting}
          />
          {errors.displayName && (
            <p id="displayName-error" className="mt-1 text-sm text-red-600" role="alert">{errors.displayName}</p>
          )}
        </div>

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
            onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            disabled={submitting}
          />
          {errors.email && (
            <p id="email-error" className="mt-1 text-sm text-red-600" role="alert">{errors.email}</p>
          )}
        </div>

        {/* Password */}
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className={`input ${errors.password ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
            value={password}
            onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
            aria-invalid={!!errors.password}
            aria-describedby={errors.password ? 'password-error' : undefined}
            disabled={submitting}
          />
          {errors.password && (
            <p id="password-error" className="mt-1 text-sm text-red-600" role="alert">{errors.password}</p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
            Confirm password
          </label>
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`input ${errors.confirmPassword ? 'border-red-400 focus:border-red-500 focus:ring-red-500/20' : ''}`}
            placeholder="Re-enter your password"
            value={confirmPassword}
            onChange={(e) => { setConfirmPassword(e.target.value); clearError('confirmPassword'); }}
            aria-invalid={!!errors.confirmPassword}
            aria-describedby={errors.confirmPassword ? 'confirmPassword-error' : undefined}
            disabled={submitting}
          />
          {errors.confirmPassword && (
            <p id="confirmPassword-error" className="mt-1 text-sm text-red-600" role="alert">{errors.confirmPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Creating account…
            </span>
          ) : (
            'Create account'
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-neutral-500">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
