import type Lenis from 'lenis';

// Shared handle so nav anchors can use Lenis when it's running.
let instance: Lenis | null = null;

export function setLenis(l: Lenis | null) {
  instance = l;
}

export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (instance) instance.scrollTo(el, { offset: -24, duration: 1.4 });
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
