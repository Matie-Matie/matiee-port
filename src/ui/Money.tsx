import { useMatieeStore } from '../store/matieeStore';
import { maskAmount, peso, pesoCompact } from '../lib/format';
import { AnimatedNumber } from './AnimatedNumber';


/**
 * The one way to render a ₱ amount. Honours privacy mode everywhere.
 * `animate` counts up on first view (skipped automatically in privacy mode).
 */
export function Money({
  value,
  compact = false,
  animate = false,
  className,
}: {
  value: number;
  compact?: boolean;
  animate?: boolean;
  className?: string;
}) {
  const privacy = useMatieeStore((s) => s.privacyMode);
  const fmt = compact ? pesoCompact : peso;

  if (privacy) return <span className={className}>{maskAmount(fmt(value))}</span>;
  if (animate) return <AnimatedNumber value={value} format={fmt} className={className} />;
  return (
    <span className={className} style={{ fontVariantNumeric: 'tabular-nums' }}>
      {fmt(value)}
    </span>
  );
}
