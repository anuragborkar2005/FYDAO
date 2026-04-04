import { HeroSection } from "@/components/landing/hero-section"

import { CTASection } from "@/components/landing/cta-section"
import { FeaturesSection } from "@/components/landing/featured-section"
import { HowItWorksSection } from "@/components/landing/how-it-works"

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <main>
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <CTASection />
      </main>
    </div>
  )
}
