import Link from 'next/link';

export default function FeedbackCTA() {
  return (
    <section className="py-16 bg-primary-600" aria-labelledby="feedback-heading">
      <div className="container-narrow text-center">
        <h2 id="feedback-heading" className="text-3xl font-bold text-white mb-4">
          We Want to Hear From You
        </h2>
        <p className="text-primary-100 text-lg mb-8 max-w-xl mx-auto">
          Have feedback, found a bug, or have a feature idea? Your input helps make EVERHERE
          better for everyone.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/feedback"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-white text-primary-700 font-medium hover:bg-primary-50 transition-colors"
          >
            Send Feedback
          </Link>
          <Link
            href="/security/report"
            className="inline-flex items-center px-6 py-3 rounded-lg bg-primary-700 text-white font-medium hover:bg-primary-800 transition-colors border border-primary-500"
          >
            Report a Security Issue
          </Link>
        </div>
      </div>
    </section>
  );
}
