'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api, type MeData } from '@/lib/api';

const navLinks = [
  { href: '/about', label: 'About' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/community', label: 'Community' },
  { href: '/contributors', label: 'Contributors' },
  { href: '/privacy', label: 'Privacy' },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<MeData | null>(null);
  const [loggingOut, setLoggingOut] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Check if logged in by fetching /me (cookies are sent automatically)
    api.getMe().then(setUser).catch(() => setUser(null));
  }, []);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await api.logout();
    } catch {
      // Ignore errors — clear state anyway
    }
    setUser(null);
    setMobileOpen(false);
    router.push('/');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-neutral-200">
      <nav className="container-wide flex items-center justify-between h-16" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary-700 hover:text-primary-800 transition-colors">
          <img src="/logo.png" alt="EVERHERE logo" className="h-9 w-auto" />
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 rounded-lg text-sm font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* CTA + Auth + Mobile toggle */}
        <div className="flex items-center gap-2">
          <Link href="/feedback" className="hidden sm:inline-flex btn-secondary text-sm">
            Feedback
          </Link>

          {user ? (
            /* Logged in: Account + Logout */
            <>
              <Link href="/account" className="hidden sm:inline-flex btn-secondary text-sm">
                <span className="w-5 h-5 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 text-xs font-bold mr-1.5">
                  {user.displayName.charAt(0).toUpperCase()}
                </span>
                Account
              </Link>
              <button
                onClick={handleLogout}
                disabled={loggingOut}
                className="hidden sm:inline-flex text-sm font-medium text-neutral-500 hover:text-danger px-3 py-2 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
              >
                {loggingOut ? 'Signing out…' : 'Sign out'}
              </button>
            </>
          ) : (
            /* Not logged in: Login + Register */
            <>
              <Link href="/login" className="hidden sm:inline-flex text-sm font-medium text-neutral-600 hover:text-primary-700 px-3 py-2 rounded-lg hover:bg-primary-50 transition-colors">
                Sign in
              </Link>
              <Link href="/contribute" className="btn-primary text-sm">
                Contribute
              </Link>
            </>
          )}

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded-lg text-neutral-600 hover:bg-neutral-100"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div id="mobile-menu" className="md:hidden border-t border-neutral-200 bg-white">
          <div className="container-wide py-4 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-3 rounded-lg text-base font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/feedback"
              className="block px-4 py-3 rounded-lg text-base font-medium text-neutral-600 hover:text-primary-700 hover:bg-primary-50 transition-colors"
              onClick={() => setMobileOpen(false)}
            >
              Feedback
            </Link>
            <hr className="border-neutral-200 my-2" />
            {user ? (
              <>
                <Link
                  href="/account"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  My Account
                </Link>
                <button
                  onClick={handleLogout}
                  disabled={loggingOut}
                  className="block w-full text-left px-4 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50"
                >
                  {loggingOut ? 'Signing out…' : 'Sign out'}
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-primary-600 hover:bg-primary-50 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-3 rounded-lg text-base font-medium text-neutral-600 hover:bg-neutral-100 transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  Create account
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
