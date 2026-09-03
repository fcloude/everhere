import type { Metadata } from 'next';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'How It Works',
  description: 'Learn how EVERHERE works — from applying to contribute to submitting safety-related contributions.',
};

export default function HowItWorksPage() {
  const steps = [
    {
      number: '1',
      title: 'Browse & Learn',
      description: 'Visit the EVERHERE website to learn about the mission, the community, and how you can help.',
      details: [
        'Read about our privacy and security posture',
        'Explore the roadmap to see what we\'re building',
        'Check out community links to connect with contributors',
      ],
    },
    {
      number: '2',
      title: 'Apply to Contribute',
      description: 'Fill out a brief application telling us about your skills and how you\'d like to help.',
      details: [
        'No phone number required',
        'Select your skills and preferred role',
        'Optional: share portfolio or GitHub links',
        'Consent to how your data will be used',
      ],
    },
    {
      number: '3',
      title: 'Review & Approval',
      description: 'Our moderation team reviews applications to maintain a safe, trustworthy community.',
      details: [
        'You\'ll receive email updates on your application status',
        'If approved, you\'ll receive an activation email',
        'Set your password and create your contributor profile',
      ],
    },
    {
      number: '4',
      title: 'Set Up Your Profile',
      description: 'Create your contributor profile — you control what\'s public.',
      details: [
        'All profile fields are private by default',
        'Toggle visibility for bio, skills, and links',
        'Add skills and a brief description',
      ],
    },
    {
      number: '5',
      title: 'Submit Contributions',
      description: 'Share your work with the community — primarily link-based at MVP.',
      details: [
        'Link to GitHub repos, design files, docs, articles',
        'Assign relevant tags for discoverability',
        'Each contribution is reviewed before becoming public',
      ],
    },
    {
      number: '6',
      title: 'Collaborate & Grow',
      description: 'Work with other contributors to improve and expand EVERHERE.',
      details: [
        'Moderators ensure quality and safety',
        'Admins manage roles and platform configuration',
        'Everyone\'s actions are audit-logged for accountability',
      ],
    },
  ];

  return (
    <>
      <Header />
      <main id="main-content" className="py-16">
        <div className="container-narrow">
          <div className="text-center mb-16">
            <h1 className="section-heading">How It Works</h1>
            <p className="section-subheading mx-auto">
              A safe, simple process from first visit to active contributor.
            </p>
          </div>

          <div className="space-y-8 max-w-3xl mx-auto">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6">
                <div className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0 mt-1">
                  {step.number}
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-neutral-900 mb-1">{step.title}</h2>
                  <p className="text-neutral-600 mb-3">{step.description}</p>
                  <ul className="space-y-1">
                    {step.details.map((detail, i) => (
                      <li key={i} className="text-sm text-neutral-500 flex items-start gap-2">
                        <span className="text-primary-400 mt-0.5" aria-hidden="true">→</span>
                        <span>{detail}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <a href="/contribute" className="btn-accent">
              Ready to Contribute?
            </a>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
