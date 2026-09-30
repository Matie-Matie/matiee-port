import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Card } from '../ui/Card';
import { Eyebrow } from '../ui/Badge';
import { Reveal } from '../ui/Reveal';
import { useMediaQuery } from '../lib/useMediaQuery';
import { cn } from '../lib/cn';
import { MockClientForm, MockNumbers, MockProject } from './mocks';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  { title: 'Add a client', body: 'Name, contact link, a note. Photos are resized automatically so your vault stays light.', Mock: MockClientForm },
  { title: 'Track the project and the money', body: 'Set the fee, deadline and downpayment. Slide progress forward and mark payments as they land.', Mock: MockProject },
  { title: 'Watch the numbers add up', body: 'Revenue collected, outstanding balances, salary and profit — computed for you, always current.', Mock: MockNumbers },
];

function Intro() {
  return (
    <div className="max-w-[560px]">
      <Reveal><Eyebrow>How it works</Eyebrow></Reveal>
      <Reveal delay={0.08}>
        <h2 className="mt-5 text-balance text-[clamp(2.2rem,4.6vw,3.5rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-ink">
          From first client to <span className="font-display italic text-brand-600">clear numbers</span> in three steps.
        </h2>
      </Reveal>
    </div>
  );
}

/** Desktop: the section pins and the stage cross-fades as you scroll (GSAP ScrollTrigger). */
function Pinned() {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const last = useRef(0);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('.how-panel');
      gsap.set(panels.slice(1), { autoAlpha: 0, y: 48, scale: 0.97 });
      const tl = gsap.timeline({
        defaults: { ease: 'power2.inOut' },
        scrollTrigger: {
          trigger: root.current,
          start: 'top top',
          end: '+=220%',
          pin: true,
          scrub: 0.7,
          onUpdate: (self) => {
            const p = self.progress;
            const s = p < 0.36 ? 0 : p < 0.76 ? 1 : 2;
            if (s !== last.current) {
              last.current = s;
              setActive(s);
            }
          },
        },
      });
      // sequential cross-fades (out, then in) so text never overlaps
      tl.to(panels[0], { autoAlpha: 0, y: -40, scale: 0.97, duration: 0.5 }, 1.3)
        .to(panels[1], { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 }, 1.8)
        .to(panels[1], { autoAlpha: 0, y: -40, scale: 0.97, duration: 0.5 }, 3.2)
        .to(panels[2], { autoAlpha: 1, y: 0, scale: 1, duration: 0.5 }, 3.7)
        .to('.how-line', { scaleY: 1, ease: 'none', duration: 4.6 }, 0);
    }, root);
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    return () => ctx.revert();
  }, []);

  return (
    <div ref={root} className="relative flex min-h-[100dvh] items-center px-8 py-16">
      <div className="mx-auto grid grid-cols-1 w-full max-w-[1240px] items-center gap-16 lg:grid-cols-[1fr_1fr]">
        <div>
          <Intro />
          <div className="relative mt-12 pl-9">
            <span className="absolute bottom-2 left-[11px] top-2 w-px bg-ink/10" />
            <span className="how-line absolute bottom-2 left-[11px] top-2 w-px origin-top scale-y-0 bg-brand-600" />
            <ol className="space-y-7">
              {STEPS.map((s, i) => (
                <li key={s.title} className={cn('relative transition-opacity duration-500', active === i ? 'opacity-100' : 'opacity-40')}>
                  <span className={cn('absolute -left-9 top-0 flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-semibold ring-4 ring-canvas transition-colors duration-500', active >= i ? 'bg-brand-600 text-white' : 'bg-ink/10 text-mute')}>{i + 1}</span>
                  <h3 className="text-[19px] font-semibold tracking-[-0.03em] text-ink">{s.title}</h3>
                  <p className="mt-1 max-w-[440px] text-[14.5px] leading-relaxed text-mute">{s.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>

        <Card bezel pad="none" className="mx-auto w-full max-w-[520px]">
          <div className="relative h-[430px]">
            {STEPS.map(({ Mock }, i) => (
              <div key={i} className="how-panel absolute inset-0"><Mock /></div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/** Mobile / reduced motion: a simple stacked story — no pinning. */
function Stacked() {
  return (
    <div className="px-4 py-24 sm:px-8">
      <div className="mx-auto max-w-[1000px]">
        <Intro />
        <ol className="mt-14 space-y-12">
          {STEPS.map(({ title, body, Mock }, i) => (
            <li key={title}>
              <Reveal>
                <div className="mb-4 flex items-center gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-semibold text-white">{i + 1}</span>
                  <h3 className="text-[19px] font-semibold tracking-[-0.03em] text-ink">{title}</h3>
                </div>
                <p className="mb-5 text-[14.5px] leading-relaxed text-mute">{body}</p>
                <Card bezel pad="none"><Mock /></Card>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

export function HowItWorks() {
  const pinned = useMediaQuery('(min-width: 1024px) and (prefers-reduced-motion: no-preference)');
  return <section id="how">{pinned ? <Pinned /> : <Stacked />}</section>;
}
