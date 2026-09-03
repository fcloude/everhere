import type { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'Security',
  description: 'EVERHERE security overview and responsible disclosure policy.',
};

export default function SecurityPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="py-16">
        <div className="container-narrow">
          <h1 className="section-heading text-center mb-4">Security Overview</h1>
          <p className="text-lg text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
            Security is a core pillar of EVERHERE. Here&apos;s how we approach it.
          </p>

          <div className="max-w-3xl mx-auto space-y-10">
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Our Approach</h2>
              <p className="text-neutral-600 leading-relaxed">
                We follow a defense-in-depth approach: multiple layers of security controls so that
                no single failure compromises the system. Every design decision prioritizes security
                and privacy over features and convenience.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Key Security Controls</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { title: 'Authentication', items: ['Argon2id hashing', 'Secure session cookies', 'Rate limiting on login'] },
                  { title: 'Authorization', items: ['Central RBAC middleware', 'Deny-by-default routing', 'IDOR checks on every fetch'] },
                  { title: 'Data Protection', items: ['Prisma parameterized queries', 'No raw SQL', 'UUID identifiers'] },
                  { title: 'Infrastructure', items: ['CSP + HSTS headers', 'CORS locked to own origins', 'TLS everywhere'] },
                  { title: 'Monitoring', items: ['Structured JSON logs', 'Append-only audit log', 'Error tracking (PII-scrubbed)'] },
                  { title: 'Process', items: ['Dependency scanning in CI', 'Role-based access test suite', 'Manual pen-test before launch'] },
                ].map((control) => (
                  <div key={control.title} className="card py-4">
                    <h3 className="font-semibold text-neutral-900 mb-2">{control.title}</h3>
                    <ul className="space-y-1">
                      {control.items.map((item) => (
                        <li key={item} className="text-sm text-neutral-600 flex items-start gap-2">
                          <span className="text-primary-500 mt-0.5" aria-hidden="true">✓</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Responsible Disclosure</h2>
              <p className="text-neutral-600 leading-relaxed mb-4">
                We welcome security researchers to responsibly disclose vulnerabilities. All reports
                are treated confidentially and acknowledged within 48 hours. We do not pursue legal
                action against researchers who follow responsible disclosure guidelines.
              </p>
              <ul className="space-y-2 text-neutral-600 mb-6">
                <li>• Report via our dedicated security channel (not general feedback)</li>
                <li>• Include a description of the vulnerability and its potential impact</li>
                <li>• Optional: proof-of-concept link (no file uploads)</li>
                <li>• Optional: contact email for follow-up</li>
              </ul>
              <Link href="/security/report" className="btn-primary">
                Submit a Security Report
              </Link>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
