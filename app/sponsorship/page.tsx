import { SiteHeader } from "@/components/site-header"
import { SponsorshipHero } from "@/components/sponsorship-hero"
import { SponsorshipStats } from "@/components/sponsorship-stats"
import { SponsorshipBenefits } from "@/components/sponsorship-benefits"
import { SponsorshipPackages } from "@/components/sponsorship-packages"
import { SponsorshipTestimonials } from "@/components/sponsorship-testimonials"
import { SponsorshipForm } from "@/components/sponsorship-form"
import { Footer } from "@/components/footer"

export default function SponsorshipPage() {
  return (
    <div className="min-h-screen bg-black">
      <SiteHeader />

      <main className="relative">
        <SponsorshipHero />
        <SponsorshipStats />
        <SponsorshipBenefits />
        <SponsorshipPackages />
        <SponsorshipTestimonials />
        <SponsorshipForm />
      </main>

      <Footer />
    </div>
  )
}
