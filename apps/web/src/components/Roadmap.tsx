const phases = [
  { phase: 1, title: 'Foundation', status: 'current', description: 'Repo scaffold, CI, lint, design tokens, deployment skeleton' },
  { phase: 2, title: 'Landing Page', status: 'current', description: 'All sections built, responsive, accessible, static export' },
  { phase: 3, title: 'Authentication', status: 'upcoming', description: 'Register, login, sessions, password reset, email verification' },
  { phase: 4, title: 'Contributor System', status: 'upcoming', description: 'Application form, review, activation, contributor profile' },
  { phase: 5, title: 'Contributions', status: 'upcoming', description: 'Link-based contributions, tags, moderation status' },
  { phase: 6, title: 'Feedback', status: 'upcoming', description: 'General feedback + separate security-report workflow' },
  { phase: 7, title: 'Moderator Dashboard', status: 'upcoming', description: 'Queues, decisions, limited permissions, audit trail' },
  { phase: 8, title: 'Admin Dashboard', status: 'upcoming', description: 'Users, roles, content, audit log, dual-control' },
  { phase: 9, title: 'Security Testing', status: 'upcoming', description: 'Dependency scanning, DAST, role-based access tests' },
  { phase: 10, title: 'Production Deploy', status: 'upcoming', description: 'Hardening, backups, monitoring, migration runbook' },
];

function StatusBadge({ status }: { status: string }) {
  if (status === 'current') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-700">
        In Progress
      </span>
    );
  }
  if (status === 'complete') {
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
        Complete
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-500">
      Upcoming
    </span>
  );
}

export default function Roadmap() {
  return (
    <section id="roadmap" className="py-20 bg-white" aria-labelledby="roadmap-heading">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h2 id="roadmap-heading" className="section-heading">Project Roadmap</h2>
          <p className="section-subheading mx-auto">
            Building EVERHERE in phases — transparent, testable, and secure at every step.
          </p>
        </div>

        <div className="space-y-4">
          {phases.map((phase) => (
            <div
              key={phase.phase}
              className={`flex items-start gap-4 p-4 rounded-xl border transition-colors ${
                phase.status === 'current'
                  ? 'border-primary-200 bg-primary-50'
                  : 'border-neutral-200 bg-white hover:border-neutral-300'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  phase.status === 'current'
                    ? 'bg-primary-600 text-white'
                    : 'bg-neutral-100 text-neutral-500'
                }`}
              >
                {phase.phase}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="font-semibold text-neutral-900">{phase.title}</h3>
                  <StatusBadge status={phase.status} />
                </div>
                <p className="text-sm text-neutral-600 mt-1">{phase.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
