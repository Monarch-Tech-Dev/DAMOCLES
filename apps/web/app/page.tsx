import { Hero } from '@/components/landing/Hero'
import { Features } from '@/components/landing/Features'
import { HowItWorks } from '@/components/landing/HowItWorks'
import { Stats } from '@/components/landing/Stats'
import { Testimonials } from '@/components/landing/Testimonials'
import { CTA } from '@/components/landing/CTA'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <Header />
      
      <main>
        <Hero />
        <Stats />
        <Features />
        <HowItWorks />
        <Testimonials />
        <CTA />
      </main>
      
      <Footer />
    </div>
  )
}