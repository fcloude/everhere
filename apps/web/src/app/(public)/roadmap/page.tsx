import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Roadmap',
  description: 'EVERHERE development roadmap — transparent, phased, and security-gated.',
};

export default function RoadmapPage() {
  const phases = [
    { phase: 1, title: 'Foundation', status: 'current', description: 'Repo scaffold, monorepo setup, CI pipeline, lint/format, base design tokens, .env templates, deployment skeleton.', highlights: ['TypeScript monorepo with pnpm workspaces', 'ESLint + Prettier configured', 'Tailwind CSS with custom design tokens'] },
    { phase: 2, title: 'Landing Page', status: 'current', description: 'All public sections built, responsive, accessible, static-exportable.', highlights: ['Hero, About, How It Works, Community', 'Privacy & Security, Roadmap, Footer', 'WCAG 2.1 AA target', 'Static export for InfinityFree'] },
    { phase: 3, title: 'Authentication', status: 'upcoming', description: 'Registration, login, sessions, password reset, email verification, MFA scaffolding.', highlights: ['Argon2id password hashing', 'httpOnly secure session cookies', 'CSRF double-submit tokens', 'MFA-ready schema'] },
    { phase: 4, title: 'Contributor System', status: 'upcoming', description: 'Application form, admin/mod review workflow, activation, contributor profile with public/private split.', highlights: ['Multi-step application form', 'Admin/mod review dashboard', 'Contributor-controlled visibility'] },
    { phase: 5, title: 'Contributions', status: 'upcoming', description: 'Link-based contributions, moderated tag system, version history.', highlights: ['Link-only submissions (MVP)', 'Moderated tag creation', 'Contribution revision history'] },
    { phase: 6, title: 'Feedback', status: 'upcoming', description: 'General feedback form + separate security-report workflow with anti-spam.', highlights: ['Category-based feedback', 'Separate security disclosure channel', 'CAPTCHA + rate limiting + honeypot'] },
    { phase: 7, title: 'Moderator Dashboard', status: 'upcoming', description: 'Contribution/tag/feedback queues, approve/reject, flag accounts, limited permissions.', highlights: ['Queue-based workflow', 'Audit trail for all actions', 'Cannot manage roles or view PII'] },
    { phase: 8, title: 'Admin Dashboard', status: 'upcoming', description: 'User/role management, content config, full audit log, dual-control on sensitive actions.', highlights: ['Dual-admin confirmation for role changes', 'Full audit log viewer', 'Community link management'] },
    { phase: 9, title: 'Security Testing', status: 'upcoming', description: 'Comprehensive security testing before any production deployment.', highlights: ['Automated dependency scanning', 'OWASP ZAP baseline scan', 'Role-based access test suite', 'Manual penetration test'] },
    { phase: 10, title: 'Production Deploy', status: 'upcoming', description: 'Production hardening, backups, monitoring, and documented migration runbook.', highlights: ['HSTS + CSP fully configured', 'Automated backups', 'Monitoring and alerting', 'Migration-off-InfinityFree runbook'] },
  ];

  return (
    <>
      <Header />
      <main id="main-content" className="py-16">
        <div className="container-narrow">
          <h1 className="section-heading text-center mb-4">Development Roadmap</h1>
          <p className="section-subheading text-center mb-16 mx-auto">
            Building EVERHERE in phases — transparent, testable, and secure at every step.
          </p>

          <div className="space-y-6">
            {phases.map((phase) => (
              <div
                key={phase.phase}
                className={`p-6 rounded-xl border ${
                  phase.status === 'current'
                    ? 'border-primary-200 bg-primary-50'
                    : 'border-neutral-200 bg-white'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                      phase.status === 'current'
                        ? 'bg-primary-600 text-white'
                        : 'bg-neutral-100 text-neutral-500'
                    }`}
                  >
                    {phase.phase}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap mb-2">
                      <h2 className="text-xl font-semibold text-neutral-900">{phase.title}</h2>
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          phase.status === 'current'
                            ? 'bg-primary-100 text-primary-700'
                            : 'bg-neutral-100 text-neutral-500'
                        }`}
                      >
                        {phase.status === 'current' ? 'In Progress' : 'Upcoming'}
                      </span>
                    </div>
                    <p className="text-neutral-600 mb-3">{phase.description}</p>
                    <ul className="flex flex-wrap gap-2">
                      {phase.highlights.map((h) => (
                        <li key={h} className="px-2 py-1 rounded bg-neutral-100 text-xs text-neutral-600">
                          {h}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
