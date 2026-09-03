'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/lib/auth-context';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const adminLinks = [
  { href: '/admin', label: 'Overview', icon: '📊' },
  { href: '/admin/users', label: 'Users', icon: '👥' },
  { href: '/admin/applications', label: 'Applications', icon: '📋' },
  { href: '/admin/contributions', label: 'Contributions', icon: '📄' },
  { href: '/admin/security-reports', label: 'Security Reports', icon: '🔒' },
  { href: '/admin/audit-logs', label: 'Audit Log', icon: '📝' },
];

function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-full lg:w-64 flex-shrink-0">
      <nav aria-label="Admin navigation">
        <ul className="space-y-1">
          {adminLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                  }`}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span aria-hidden="true">{link.icon}</span>
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, loading, error } = useAuth();

  if (loading) {
    return (
      <>
        <Header />
        <main id="main-content" className="py-16">
          <div className="container-wide flex items-center justify-center py-20">
            <div className="text-neutral-500" role="status">
              <div className="animate-spin w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full mx-auto mb-3" />
              <p>Loading admin dashboard…</p>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !user || user.role !== 'admin') {
    return (
      <>
        <Header />
        <main id="main-content" className="py-16">
          <div className="container-narrow text-center">
            <div className="card py-12">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-100 flex items-center justify-center" aria-hidden="true">
                <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h1 className="text-xl font-semibold text-neutral-900 mb-2">Admin Access Required</h1>
              <p className="text-neutral-600 mb-6">
                {error || 'You need admin privileges to access this page.'}
              </p>
              <Link href="/" className="btn-primary">Go to Homepage</Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main id="main-content" className="py-8 lg:py-12">
        <div className="container-wide">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl" aria-hidden="true">⚙️</span>
            <div>
              <h1 className="text-2xl font-bold text-neutral-900">Admin Dashboard</h1>
              <p className="text-sm text-neutral-500">System management and oversight</p>
            </div>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <AdminSidebar />
            <div className="flex-1 min-w-0">{children}</div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
