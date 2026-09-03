import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'About',
  description: 'Learn about EVERHERE — a free, community-built personal-safety communication platform.',
};

export default function AboutPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="py-16">
        <div className="container-narrow prose prose-neutral max-w-none">
          <h1 className="section-heading text-center mb-4">About EVERHERE</h1>
          <p className="text-lg text-neutral-600 text-center mb-12 max-w-2xl mx-auto">
            A free, community-built personal-safety communication platform.
          </p>

          <div className="max-w-3xl mx-auto space-y-8">
            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Our Mission</h2>
              <p className="text-neutral-600 leading-relaxed">
                EVERHERE exists because everyone deserves a quick way to signal their safety status
                and reach trusted humans when help is needed. We believe safety tools should be
                free, transparent, and built by the community they serve.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">What We Are</h2>
              <ul className="text-neutral-600 leading-relaxed space-y-2">
                <li><strong>Community-built</strong> — developers, designers, researchers, and safety advocates working together</li>
                <li><strong>Free</strong> — no premium tiers, no paywalls on safety features</li>
                <li><strong>Open</strong> — transparent development, open governance, community-driven roadmap</li>
                <li><strong>Security-first</strong> — OWASP-aligned, privacy-minimized, audited by the community</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">What We Are Not</h2>
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200">
                <p className="text-amber-800 leading-relaxed">
                  EVERHERE is <strong>not</strong> a replacement for emergency services, police,
                  guardians, or trained professionals. If you are in immediate danger, please
                  contact your local emergency services immediately.
                </p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-neutral-900 mb-3">Technology</h2>
              <p className="text-neutral-600 leading-relaxed">
                Built with Next.js, TypeScript, and PostgreSQL — boring, well-understood technology
                that a rotating volunteer team can maintain. No exotic frameworks, no vendor lock-in.
              </p>
            </section>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
