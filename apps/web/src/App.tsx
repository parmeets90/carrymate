import { useEffect, useState } from 'react';
import { ContentContext, FALLBACK, fetchContent, type SiteContent } from './lib/content';
import { Nav } from './components/Nav';
import { Hero } from './components/Hero';
import { Stories } from './components/Stories';
import { HowItWorks } from './components/HowItWorks';
import { Trust } from './components/Trust';
import { Stats } from './components/Stats';
import { Technology } from './components/Technology';
import { Compare } from './components/Compare';
import { Testimonials } from './components/Testimonials';
import { About } from './components/About';
import { FAQ } from './components/FAQ';
import { CTA } from './components/CTA';
import { Footer } from './components/Footer';

export default function App() {
  // Hydrate from the CMS after mount; static fallback renders instantly so
  // there's never a blank state or layout shift.
  const [content, setContent] = useState<SiteContent>(FALLBACK);
  useEffect(() => {
    let alive = true;
    fetchContent().then((c) => alive && setContent(c));
    return () => {
      alive = false;
    };
  }, []);

  return (
    <ContentContext.Provider value={content}>
    <div className="min-h-screen bg-bone">
      <a
        href="#how"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-navy focus:px-4 focus:py-2 focus:text-sm focus:text-bone"
      >
        Skip to content
      </a>
      <Nav />
      <main>
        <Hero />
        <Stories />
        <HowItWorks />
        <Trust />
        <Stats />
        <Technology />
        <Compare />
        <Testimonials />
        <About />
        <FAQ />
        <CTA />
      </main>
      <Footer />
    </div>
    </ContentContext.Provider>
  );
}
