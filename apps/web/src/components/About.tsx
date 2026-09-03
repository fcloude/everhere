export default function About() {
  return (
    <section id="about" className="py-20 bg-white" aria-labelledby="about-heading">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h2 id="about-heading" className="section-heading">What is EVERHERE?</h2>
          <p className="section-subheading mx-auto">
            A community-driven platform focused on personal safety communication.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          <div className="card text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center" aria-hidden="true">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Safety Signals</h3>
            <p className="text-neutral-600">
              Signal your safety status and reach trusted humans quickly when help is needed.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center" aria-hidden="true">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Community-Built</h3>
            <p className="text-neutral-600">
              Developers, designers, researchers, and safety advocates building tools together —
              for everyone, by everyone.
            </p>
          </div>

          <div className="card text-center">
            <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary-100 flex items-center justify-center" aria-hidden="true">
              <svg className="w-6 h-6 text-primary-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-900 mb-2">Security &amp; Privacy First</h3>
            <p className="text-neutral-600">
              Built with OWASP-aligned security, GDPR-style data minimization,
              and transparent practices from day one.
            </p>
          </div>
        </div>

        <div className="mt-12 p-6 bg-primary-50 rounded-xl border border-primary-100">
          <p className="text-sm text-primary-800 text-center">
            <strong>Important:</strong> EVERHERE is <em>not</em> a replacement for emergency services,
            police, guardians, or trained professionals. If you are in immediate danger, please contact
            your local emergency services.
          </p>
        </div>
      </div>
    </section>
  );
}
