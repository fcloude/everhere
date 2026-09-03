import Link from 'next/link';

const footerLinks = {
  Product: [
    { href: '/about', label: 'About' },
    { href: '/how-it-works', label: 'How It Works' },

    { href: '/feedback', label: 'Feedback' },
  ],
  Community: [
    { href: '/community', label: 'Join Us' },
    { href: '/contribute', label: 'Apply to Contribute' },
    { href: 'https://reddit.com/r/everhere_official', label: 'Reddit' },
    { href: 'https://t.me/everheregroup', label: 'Telegram' },
    { href: 'https://chat.whatsapp.com/Claz8fIeFxl3DKpVboO1fv', label: 'WhatsApp' },
  ],
  Legal: [
    { href: '/privacy', label: 'Privacy Policy' },
    { href: '/security', label: 'Security' },
    { href: '/security/report', label: 'Report Vulnerability' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400" role="contentinfo">
      <div className="container-wide py-12 lg:py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-white font-bold text-lg mb-3">
              <img src="/logo.png" alt="EVERHERE logo" className="h-8 w-auto" />
            </Link>
            <p className="text-sm leading-relaxed">
              You&apos;re not alone when help is needed. A community-built personal-safety
              communication platform.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="text-white font-semibold text-sm mb-3">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-neutral-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs">
            © {new Date().getFullYear()} EVERHERE. Free and community-built.
          </p>
          <p className="text-xs">
            <span className="text-neutral-500">⚠️</span> Not a replacement for emergency services.
            If you are in danger, call your local emergency number.
          </p>
        </div>
      </div>
    </footer>
  );
}
