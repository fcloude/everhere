import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Community',
  description: 'Join the EVERHERE community — find your role in building a safer world.',
};

export default function CommunityPage() {
  const roles = [
    { emoji: '💻', name: 'Developers', description: 'Build and maintain the platform, APIs, and tools.', skills: ['TypeScript', 'React', 'Node.js', 'PostgreSQL', 'DevOps'] },
    { emoji: '🎨', name: 'Designers', description: 'Shape the user experience and visual identity.', skills: ['UI/UX', 'Figma', 'Accessibility', 'Design Systems'] },
    { emoji: '🔬', name: 'Researchers', description: 'Inform safety practices and community guidelines.', skills: ['Safety Research', 'UX Research', 'Data Analysis'] },
    { emoji: '🔐', name: 'Security Reviewers', description: 'Audit the platform for vulnerabilities and improve security posture.', skills: ['Web Security', 'Pen Testing', 'OWASP', 'Code Review'] },
    { emoji: '🛡️', name: 'Moderators', description: 'Maintain community standards and review contributions.', skills: ['Communication', 'Conflict Resolution', 'Community Management'] },
    { emoji: '🧪', name: 'Testers', description: 'Ensure quality, accessibility, and reliability.', skills: ['QA', 'E2E Testing', 'Accessibility Testing', 'Performance'] },
    { emoji: '📝', name: 'Documentarians', description: 'Write documentation, guides, and tutorials.', skills: ['Technical Writing', 'Markdown', 'API Docs'] },
    { emoji: '💬', name: 'Community Builders', description: 'Grow, support, and engage the contributor community.', skills: ['Communication', 'Event Planning', 'Social Media'] },
  ];

  return (
    <>
      <Header />
      <main id="main-content" className="py-16">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h1 className="section-heading">Community</h1>
            <p className="section-subheading mx-auto">
              Everyone has something to offer. Find your role in building EVERHERE.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {roles.map((role) => (
              <div key={role.name} className="card">
                <div className="flex items-start gap-4">
                  <span className="text-3xl" aria-hidden="true">{role.emoji}</span>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900">{role.name}</h3>
                    <p className="text-sm text-neutral-600 mt-1">{role.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {role.skills.map((skill) => (
                        <span key={skill} className="px-2 py-1 rounded-md bg-neutral-100 text-xs text-neutral-600">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <h2 className="text-2xl font-bold text-neutral-900 mb-4">Connect With Us</h2>
            <p className="text-neutral-600 mb-6">Join the conversation on your preferred platform:</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="https://reddit.com/r/everhere_official" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                📖 Reddit
              </a>
              <a href="https://t.me/everheregroup" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                📱 Telegram
              </a>
              <a href="https://chat.whatsapp.com/Claz8fIeFxl3DKpVboO1fv" target="_blank" rel="noopener noreferrer" className="btn-secondary">
                💬 WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
