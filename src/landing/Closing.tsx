import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, DatabaseBackup, EyeOff, HardDrive, ServerOff } from 'lucide-react';
import { Card } from '../ui/Card';
import { Eyebrow } from '../ui/Badge';
import { LinkButton } from '../ui/Button';
import { Reveal } from '../ui/Reveal';
import { BrandMark } from '../app/Brand';
import { APP_NAME } from '../config';
import { R } from '../routes';
import { fadeUp, stagger } from '../lib/motion';
import { scrollToId } from './scroll';

const FACTS = [
  { icon: HardDrive, title: 'Stored in your browser', body: 'Everything lives in local storage on your device. There is no account and no database behind it.' },
  { icon: ServerOff, title: 'Nothing is uploaded', body: 'Your clients, amounts and files are never sent to a server.' },
  { icon: DatabaseBackup, title: 'One-click backup', body: 'Export the whole vault as a JSON file, then merge it back or replace from it any time.' },
  { icon: EyeOff, title: 'Privacy mode', body: 'Mask every amount and client name instantly when someone else is looking.' },
];

export function Privacy() {
  return (
    <section id="privacy" className="px-4 py-24 sm:px-8 md:py-36">
      <div className="mx-auto max-w-[1240px]">
        <Card bezel tone="ink" pad="none">
          <div className="grid grid-cols-1 gap-12 p-8 md:p-14 lg:grid-cols-[1fr_1.1fr] lg:gap-16">
            <div>
              <Reveal><Eyebrow className="!bg-white/10 !text-brand-300">Privacy</Eyebrow></Reveal>
              <Reveal delay={0.08}>
                <h2 className="mt-5 text-balance text-[clamp(2.2rem,4.6vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.05em] text-white">
                  Your numbers <span className="font-display italic text-brand-300">stay yours.</span>
                </h2>
              </Reveal>
              <Reveal delay={0.16}>
                <p className="mt-5 max-w-[440px] text-[16px] leading-relaxed text-white/65">
                  Matie Port is local-first by design. No sign-up, no tracking of your data, nothing to leak — because your business records never leave your device.
                </p>
              </Reveal>
            </div>
            <motion.ul variants={stagger(0.09)} initial="hidden" whileInView="show" viewport={{ once: true, margin: '0px 0px -10% 0px' }} className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {FACTS.map((f) => {
                const Icon = f.icon;
                return (
                  <motion.li key={f.title} variants={fadeUp} className="rounded-[22px] bg-white/[0.06] p-5 ring-1 ring-white/10 transition-colors duration-500 hover:bg-white/[0.09]">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-brand-300"><Icon size={18} strokeWidth={1.6} /></span>
                    <h3 className="mt-4 text-[15.5px] font-semibold tracking-tight text-white">{f.title}</h3>
                    <p className="mt-1.5 text-[13.5px] leading-relaxed text-white/60">{f.body}</p>
                  </motion.li>
                );
              })}
            </motion.ul>
          </div>
        </Card>
      </div>
    </section>
  );
}

export function Cta() {
  return (
    <section className="relative overflow-hidden px-4 pb-28 pt-12 sm:px-8 md:pb-40">
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-1/2 h-[640px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60" style={{ background: 'radial-gradient(closest-side, rgb(130 203 165 / 0.35), rgb(244 242 235 / 0) 72%)' }} />
      <div className="relative mx-auto max-w-[900px] text-center">
        <Reveal>
          <h2 className="font-display text-[clamp(3.4rem,11vw,8rem)] leading-[0.92] text-ink">Open your vault.</h2>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mx-auto mt-6 max-w-[460px] text-[17px] leading-relaxed text-mute">No sign-up. Nothing to install. Start with a single client and let the numbers build themselves.</p>
        </Reveal>
        <Reveal delay={0.2}>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <LinkButton to={R.dashboard} size="lg" trailing>Open your vault</LinkButton>
            <span className="flex items-center gap-1.5 text-[13px] text-mute"><Check size={14} strokeWidth={2.5} className="text-brand-600" /> Free to use</span>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-ink/[0.07] px-4 py-10 sm:px-8">
      <div className="mx-auto flex max-w-[1240px] flex-col items-start justify-between gap-6 md:flex-row md:items-center">
        <Link to={R.welcome} className="flex items-center gap-3">
          <BrandMark size={34} />
          <span className="text-[15px] font-semibold tracking-[-0.03em] text-ink">{APP_NAME}</span>
        </Link>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-[13px] text-mute">
          <button type="button" onClick={() => scrollToId('features')} className="transition-colors hover:text-ink">Features</button>
          <button type="button" onClick={() => scrollToId('how')} className="transition-colors hover:text-ink">How it works</button>
          <button type="button" onClick={() => scrollToId('privacy')} className="transition-colors hover:text-ink">Privacy</button>
          <Link to={R.dashboard} className="transition-colors hover:text-ink">Open vault</Link>
        </nav>
        <p className="text-xs text-mute">Built by Mat Edra · © {new Date().getFullYear()}</p>
      </div>
    </footer>
  );
}
