import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Contributors',
  description: 'Meet the community contributors building EVERHERE — the personal-safety communication platform.',
};

const CONTRIBUTOR_ROLES: Record<string, { emoji: string; label: string }> = {
  developer: { emoji: '💻', label: 'Developer' },
  designer: { emoji: '🎨', label: 'Designer' },
  researcher: { emoji: '🔬', label: 'Researcher' },
  security: { emoji: '🔒', label: 'Security' },
  moderator: { emoji: '🛡️', label: 'Moderator' },
  tester: { emoji: '🧪', label: 'Tester' },
  docs: { emoji: '📝', label: 'Documentation' },
  community: { emoji: '💬', label: 'Community' },
  other: { emoji: '⭐', label: 'Other' },
};

// Static placeholder data — will be replaced with API call in production
const PLACEHOLDER_CONTRIBUTORS = [
  { id: '1', displayName: 'Community Team', role: 'community', skills: ['Community Management', 'Research'], bio: 'Building a safe, inclusive community.' },
  { id: '2', displayName: 'Core Dev Team', role: 'developer', skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'], bio: 'Developing the EVERHERE platform.' },
  { id: '3', displayName: 'Design Collective', role: 'designer', skills: ['UI/UX Design', 'Figma', 'Tailwind CSS', 'Accessibility'], bio: 'Creating accessible, beautiful interfaces.' },
  { id: '4', displayName: 'Security Reviewers', role: 'security', skills: ['Security', 'Testing'], bio: 'Keeping the platform safe and secure.' },
];

export default function ContributorsPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="py-12 lg:py-16">
        <div className="container-wide">
          {/* Hero */}
          <div className="text-center mb-12">
            <h1 className="section-heading">Our Contributors</h1>
            <p className="section-subheading mx-auto">
              EVERHERE is built by a community of volunteers. Meet the people contributing their skills
              to make personal safety accessible to everyone.
            </p>
          </div>

          {/* Contributor grid */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {PLACEHOLDER_CONTRIBUTORS.map((contributor) => {
              const roleInfo = CONTRIBUTOR_ROLES[contributor.role] || CONTRIBUTOR_ROLES.other;
              return (
                <div key={contributor.id} className="card hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-xl" aria-hidden="true">
                      {roleInfo.emoji}
                    </div>
                    <div>
                      <h2 className="font-semibold text-neutral-900">{contributor.displayName}</h2>
                      <span className="text-xs text-primary-600 font-medium">{roleInfo.label}</span>
                    </div>
                  </div>
                  {contributor.bio && (
                    <p className="text-sm text-neutral-600 mb-3">{contributor.bio}</p>
                  )}
                  {contributor.skills && contributor.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {contributor.skills.map((skill) => (
                        <span key={skill} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 text-xs rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="card text-center py-12">
            <h2 className="text-2xl font-bold text-neutral-900 mb-3">
              Want to join us?
            </h2>
            <p className="text-neutral-600 mb-6 max-w-lg mx-auto">
              We&apos;re looking for developers, designers, researchers, security reviewers,
              and community organizers. No experience barrier — just a willingness to help.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/contribute" className="btn-primary">
                Apply to Contribute
              </Link>
              <Link href="/community" className="btn-secondary">
                See Open Roles
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
