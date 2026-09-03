import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Privacy & Security',
  description: 'EVERHERE\'s commitment to privacy and security — data minimization, OWASP alignment, and transparent practices.',
};

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="py-16">
        <div className="container-narrow">
          <h1 className="section-heading text-center mb-4">Privacy &amp; Security</h1>
          <p className="text-lg text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
            A safety system should not create a new safety problem. We treat security and privacy
            as foundational, not afterthoughts.
          </p>

          <div className="max-w-3xl mx-auto space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Data We Collect</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-neutral-100">
                    <tr>
                      <th className="px-4 py-3 font-semibold text-neutral-700">Data</th>
                      <th className="px-4 py-3 font-semibold text-neutral-700">Why</th>
                      <th className="px-4 py-3 font-semibold text-neutral-700">Public?</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    <tr>
                      <td className="px-4 py-3 text-neutral-600">Display Name</td>
                      <td className="px-4 py-3 text-neutral-600">Attribution</td>
                      <td className="px-4 py-3 text-neutral-600">Contributor-controlled</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-neutral-600">Email</td>
                      <td className="px-4 py-3 text-neutral-600">Auth &amp; notifications</td>
                      <td className="px-4 py-3 text-neutral-600">Never</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-neutral-600">Phone</td>
                      <td className="px-4 py-3 text-neutral-600">Not collected in MVP</td>
                      <td className="px-4 py-3 text-neutral-600">—</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-neutral-600">Skills</td>
                      <td className="px-4 py-3 text-neutral-600">Matching contributors</td>
                      <td className="px-4 py-3 text-neutral-600">Contributor-controlled</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-neutral-600">Portfolio Links</td>
                      <td className="px-4 py-3 text-neutral-600">Vetting &amp; attribution</td>
                      <td className="px-4 py-3 text-neutral-600">Contributor-controlled</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-neutral-600">IP / Session Data</td>
                      <td className="px-4 py-3 text-neutral-600">Security only</td>
                      <td className="px-4 py-3 text-neutral-600">Never</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Data Minimization</h2>
              <ul className="space-y-2 text-neutral-600">
                <li>• No phone number collected by default</li>
                <li>• All profile fields private unless contributor explicitly enables them</li>
                <li>• No third-party tracking or analytics (self-hosted Plausible only)</li>
                <li>• IP data used only for rate limiting and session security, then discarded</li>
                <li>• Account deletion purges all PII within 30 days</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Security Practices</h2>
              <ul className="space-y-2 text-neutral-600">
                <li>• OWASP ASVS-aligned security posture</li>
                <li>• Argon2id password hashing (memory-hard, resistance to GPU attacks)</li>
                <li>• Mandatory MFA for admin and moderator roles</li>
                <li>• httpOnly, Secure, SameSite=Lax session cookies</li>
                <li>• CSRF double-submit token on all state-changing requests</li>
                <li>• Rate limiting with exponential backoff on all public endpoints</li>
                <li>• CSP, HSTS, and other security headers enabled</li>
                <li>• Prisma parameterized queries only — no raw SQL</li>
                <li>• Append-only audit log on all privileged actions</li>
                <li>• UUIDs for all public-facing identifiers (no sequential IDs)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Data Retention</h2>
              <ul className="space-y-2 text-neutral-600">
                <li>• Rejected applications: 90 days, then purged</li>
                <li>• Active accounts: retained while active</li>
                <li>• Account deletion: PII purged within 30 days</li>
                <li>• Security reports: 1 year retained, then anonymized</li>
                <li>• Audit logs: retained indefinitely (de-identified) for security accountability</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Report a Vulnerability</h2>
              <p className="text-neutral-600 mb-4">
                If you discover a security vulnerability, please report it responsibly through our
                dedicated security reporting channel. We take all reports seriously and will
                acknowledge receipt within 48 hours.
              </p>
              <a href="/security/report" className="btn-primary">
                Report a Security Issue
              </a>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
