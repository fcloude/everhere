export default function HowItWorks() {
  const steps = [
    {
      number: '1',
      title: 'Apply to Contribute',
      description:
        'Fill out a brief application telling us about your skills and how you\'d like to help. No phone number required.',
    },
    {
      number: '2',
      title: 'Get Reviewed',
      description:
        'Our moderation team reviews applications to ensure a safe, trustworthy community. You\'ll hear back via email.',
    },
    {
      number: '3',
      title: 'Set Up Your Profile',
      description:
        'Once approved, create your contributor profile. You control what\'s public — default is private.',
    },
    {
      number: '4',
      title: 'Contribute',
      description:
        'Submit link-based contributions (repos, designs, docs, articles). Each is reviewed before becoming public.',
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-neutral-50" aria-labelledby="how-heading">
      <div className="container-narrow">
        <div className="text-center mb-16">
          <h2 id="how-heading" className="section-heading">How It Works</h2>
          <p className="section-subheading mx-auto">
            A simple, safe process to join the community and start contributing.
          </p>
        </div>

        <div className="relative">
          {/* Connector line */}
          <div className="hidden lg:block absolute top-12 left-[calc(12.5%+1rem)] right-[calc(12.5%+1rem)] h-0.5 bg-primary-200" aria-hidden="true" />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step) => (
              <div key={step.number} className="relative text-center">
                <div className="w-10 h-10 mx-auto mb-4 rounded-full bg-primary-600 text-white flex items-center justify-center font-bold text-lg relative z-10">
                  {step.number}
                </div>
                <h3 className="text-lg font-semibold text-neutral-900 mb-2">{step.title}</h3>
                <p className="text-neutral-600 text-sm leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-12 text-center text-sm text-neutral-500">
          Contributions are primarily link-based — GitHub repos, design files, documentation, and articles.
          This keeps the platform safe and simple.
        </p>
      </div>
    </section>
  );
}
