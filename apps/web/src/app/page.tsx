import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import HowItWorks from '@/components/HowItWorks';
import Community from '@/components/Community';
import PrivacySecurity from '@/components/PrivacySecurity';
import FeedbackCTA from '@/components/FeedbackCTA';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <About />
        <HowItWorks />
        <Community />
        <PrivacySecurity />
        <FeedbackCTA />
      </main>
      <Footer />
    </>
  );
}
