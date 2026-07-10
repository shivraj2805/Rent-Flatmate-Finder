import LandingNavbar from '../components/landing/LandingNavbar.jsx'
import LandingHero from '../components/landing/LandingHero.jsx'
import LandingStats from '../components/landing/LandingStats.jsx'
import LandingFeatures from '../components/landing/LandingFeatures.jsx'
import LandingHowItWorks from '../components/landing/LandingHowItWorks.jsx'
import LandingAiShowcase from '../components/landing/LandingAiShowcase.jsx'
import LandingFeaturedListings from '../components/landing/LandingFeaturedListings.jsx'
import LandingTestimonials from '../components/landing/LandingTestimonials.jsx'
import LandingFaq from '../components/landing/LandingFaq.jsx'
import LandingCta from '../components/landing/LandingCta.jsx'
import LandingFooter from '../components/landing/LandingFooter.jsx'

const Landing = () => {
  return (
    <main className="min-h-screen bg-white text-slate-900 antialiased">
      <LandingNavbar />
      <LandingHero />
      <LandingStats />
      <LandingFeatures />
      <LandingHowItWorks />
      <LandingAiShowcase />
      <LandingFeaturedListings />
      <LandingTestimonials />
      <LandingFaq />
      <LandingCta />
      <LandingFooter />
    </main>
  )
}

export default Landing