const roles = [
  { emoji: '💻', name: 'Developers', description: 'Build the platform and tools' },
  { emoji: '🎨', name: 'Designers', description: 'Shape the user experience' },
  { emoji: '🔬', name: 'Researchers', description: 'Inform safety practices' },
  { emoji: '🔐', name: 'Security Reviewers', description: 'Keep the platform safe' },
  { emoji: '🛡️', name: 'Moderators', description: 'Maintain community standards' },
  { emoji: '🧪', name: 'Testers', description: 'Ensure quality and accessibility' },
  { emoji: '📝', name: 'Documentarians', description: 'Write docs and guides' },
  { emoji: '💬', name: 'Community', description: 'Grow and support the community' },
];

export default function Community() {
  return (
    <section id="community" className="py-20 bg-white" aria-labelledby="community-heading">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h2 id="community-heading" className="section-heading">Join the Community</h2>
          <p className="section-subheading mx-auto">
            Everyone has something to offer. Find your role in building EVERHERE.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {roles.map((role) => (
            <div key={role.name} className="card text-center py-4 px-3">
              <span className="text-2xl block mb-2" aria-hidden="true">{role.emoji}</span>
              <h3 className="font-semibold text-neutral-900 text-sm">{role.name}</h3>
              <p className="text-xs text-neutral-500 mt-1">{role.description}</p>
            </div>
          ))}
        </div>

        {/* Social/Community links placeholder */}
        <div className="text-center">
          <p className="text-neutral-600 mb-6">Connect with the EVERHERE community:</p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="https://reddit.com/r/everhere_official"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors"
            >
              <span aria-hidden="true">📖</span>
              <span>Reddit</span>
            </a>
            <a
              href="https://t.me/everheregroup"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors"
            >
              <span aria-hidden="true">📱</span>
              <span>Telegram</span>
            </a>
            <a
              href="https://chat.whatsapp.com/Claz8fIeFxl3DKpVboO1fv"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg bg-neutral-100 text-neutral-700 font-medium hover:bg-neutral-200 transition-colors"
            >
              <span aria-hidden="true">💬</span>
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
