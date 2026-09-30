import { useMatieeStore } from '../store/matieeStore';
import { maskName } from './format';

/** Privacy-aware helpers for places PrivateText/Money can't reach (aria-labels, dialog titles, chart axes). */
export function usePrivacy() {
  const on = useMatieeStore((s) => s.privacyMode);
  return { on, name: (n: string) => (on ? maskName(n) : n) };
}
