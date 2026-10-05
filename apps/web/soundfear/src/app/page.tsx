import {
   AnalysisBreakdown,
   FinalCta,
   Footer,
   Hero,
   HowItWorks,
   Navbar,
   Pricing,
   Privacy,
   Problem,
   ProductDemo,
   ProgressTracking,
   UseCases,
} from '@/modules/home';

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
