import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Nav } from './Nav';
import { Hero } from './Hero';
import { Showcase, Ticker } from './Showcase';
import { Features } from './Features';
import { HowItWorks } from './HowItWorks';
import { Cta, Footer, Privacy } from './Closing';
import { setLenis } from './scroll';

gsap.registerPlugin(ScrollTrigger);

export default function Landing() {
  // Smooth scrolling, wired into ScrollTrigger. Skipped entirely for reduced motion.
  useEffect(() => {
    window.scrollTo(0, 0);
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    setLenis(lenis);
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return (
    <div className="relative bg-canvas">
      <Nav />
      <main>
        <Hero />
        <Ticker />
        <Showcase />
        <Features />
        <HowItWorks />
        <Privacy />
        <Cta />
      </main>
      <Footer />
    </div>
  );
}
