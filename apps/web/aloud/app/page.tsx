import { Navbar } from '@/components/navbar';
import { Footer } from '@/components/footer';
import { Hero } from '@/components/sections/hero';
import { HowItWorks } from '@/components/sections/how-it-works';
import { Problem } from '@/components/sections/problem';
import { ProductDemo } from '@/components/sections/product-demo';
import { AnalysisBreakdown } from '@/components/sections/analysis-breakdown';
import { ProgressTracking } from '@/components/sections/progress-tracking';
import { UseCases } from '@/components/sections/use-cases';
import { Privacy } from '@/components/sections/privacy';
import { Pricing } from '@/components/sections/pricing';
import { FinalCta } from '@/components/sections/final-cta';

export default function Home() {
   return (
      <>
         <Navbar />
         <main>
            <Hero />
            <HowItWorks />
            <Problem />
            <ProductDemo />
            <AnalysisBreakdown />
            <ProgressTracking />
            <UseCases />
            <Privacy />
            <Pricing />
            <FinalCta />
         </main>
         <Footer />
      </>
   );
}
