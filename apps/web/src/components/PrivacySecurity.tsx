import Link from 'next/link';

export default function PrivacySecurity() {
  return (
    <section id="privacy" className="py-20 bg-neutral-50" aria-labelledby="privacy-heading">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h2 id="privacy-heading" className="section-heading">Privacy &amp; Security</h2>
          <p className="section-subheading mx-auto">
            A safety system should not create a new safety problem. We take this seriously.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Data Minimization
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5" aria-hidden="true">✓</span>
                <span>No phone number collected by default</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5" aria-hidden="true">✓</span>
                <span>Profile fields private unless you choose to share</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5" aria-hidden="true">✓</span>
                <span>No third-party tracking or analytics</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5" aria-hidden="true">✓</span>
                <span>Account deletion purges PII within 30 days</span>
              </li>
            </ul>
          </div>

          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-900 mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              Security Practices
            </h3>
            <ul className="space-y-2 text-sm text-neutral-600">
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5" aria-hidden="true">✓</span>
                <span>OWASP-aligned security posture</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5" aria-hidden="true">✓</span>
                <span>Argon2id password hashing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5" aria-hidden="true">✓</span>
                <span>Mandatory MFA for admin/moderator roles</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5" aria-hidden="true">✓</span>
                <span>Rate limiting and anti-abuse protections</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary-500 mt-0.5" aria-hidden="true">✓</span>
                <span>Audit logging on all privileged actions</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="text-center space-x-4">
          <Link href="/privacy" className="btn-secondary text-sm">
            Full Privacy Policy
          </Link>
          <Link href="/security" className="btn-secondary text-sm">
            Security Overview
          </Link>
          <Link href="/security/report" className="btn-primary text-sm">
            Report a Vulnerability
          </Link>
        </div>
      </div>
    </section>
  );
}
