'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { PASSWORD_MIN_LENGTH } from '@everhere/shared';

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setServerError('No reset token found. Please request a new password reset link.');
    }
  }, [token]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!password) errs.password = 'Password is required';
    else if (password.length < PASSWORD_MIN_LENGTH) errs.password = `Password must be at least ${PASSWORD_MIN_LENGTH} characters`;
    if (!confirmPassword) errs.confirmPassword = 'Please confirm your password';
    else if (password !== confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !validate()) return;

    setSubmitting(true);
    setServerError(null);

    try {
      await api.resetPassword({ token, password, confirmPassword });
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
        <h1 className="text-2xl font-bold text-neutral-900 mb-2">Password reset complete</h1>
        <p className="text-sm text-neutral-500 mb-6">
          Your password has been updated. You can now sign in with your new password.
        </p>
        <Link href="/login" className="btn-primary">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="card">
      <h1 className="text-2xl font-bold text-neutral-900 mb-2">Set new password</h1>
      <p className="text-sm text-neutral-500 mb-6">
        Choose a strong password for your account.
      </p>

      {serverError && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm mb-6" role="alert">
          {serverError}
        </div>
      )}

      {!token ? (
        <div className="text-center py-8">
          <p className="text-neutral-500 mb-4">
            This reset link is invalid or missing a token.
          </p>
          <Link href="/forgot-password" className="btn-primary">
            Request new reset link
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-neutral-700 mb-1">
              New password
            </label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              className={`input ${errors.password ? 'border-red-400' : ''}`}
              placeholder={`At least ${PASSWORD_MIN_LENGTH} characters`}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setErrors((p) => { const n = { ...p }; delete n.password; return n; }); }}
              aria-invalid={!!errors.password}
              disabled={submitting}
            />
            {errors.password && <p className="mt-1 text-sm text-red-600" role="alert">{errors.password}</p>}
          </div>

          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-neutral-700 mb-1">
              Confirm new password
            </label>
            <input
              id="confirmPassword"
              type="password"
              autoComplete="new-password"
              className={`input ${errors.confirmPassword ? 'border-red-400' : ''}`}
              placeholder="Re-enter your new password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); setErrors((p) => { const n = { ...p }; delete n.confirmPassword; return n; }); }}
              aria-invalid={!!errors.confirmPassword}
              disabled={submitting}
            />
            {errors.confirmPassword && <p className="mt-1 text-sm text-red-600" role="alert">{errors.confirmPassword}</p>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="card text-center py-12">
        <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
        <p className="text-sm text-neutral-500">Loading…</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
