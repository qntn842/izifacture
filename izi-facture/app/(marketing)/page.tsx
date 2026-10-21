import { FeaturesSection } from '@/components/landing/FeaturesSection';
import { FinalCta } from '@/components/landing/FinalCta';
import { Hero } from '@/components/landing/Hero';
import { HowItWorks } from '@/components/landing/HowItWorks';
import { LandingFooter } from '@/components/landing/LandingFooter';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { Pricing } from '@/components/landing/Pricing';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { Testimonials } from '@/components/landing/Testimonials';

/** Landing page publique : https://…/ */
export default function LandingPage() {
  return (
    <>
      <LandingHeader />
      <main>
        <Hero />
        <ProblemSection />
        <FeaturesSection />
        <HowItWorks />
        <Testimonials />
        <Pricing />
        <FinalCta />
      </main>
      <LandingFooter />
    </>
  );
}
