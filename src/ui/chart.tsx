import { maskAmount, peso } from '../lib/format';
import { useMatieeStore } from '../store/matieeStore';

interface TipPayload {
  name?: string;
  value?: number | string;
  color?: string;
  dataKey?: string;
}

/** Shared Recharts tooltip. Pass `money` to render values as (privacy-aware) ₱. */
export function ChartTooltip({
  active,
  payload,
  label,
  money = true,
  labelFormatter,
}: {
  active?: boolean;
  payload?: TipPayload[];
  label?: string | number;
  money?: boolean;
  labelFormatter?: (l: string | number | undefined) => string;
}) {
  const privacy = useMatieeStore((s) => s.privacyMode);
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[140px] rounded-2xl bg-ink px-3.5 py-2.5 text-white shadow-pop">
      {label !== undefined && (
        <p className="mb-1.5 text-[11px] font-medium text-white/60">{labelFormatter ? labelFormatter(label) : label}</p>
      )}
      <div className="space-y-1">
        {payload.map((p, i) => (
          <div key={i} className="flex items-center justify-between gap-4 text-xs">
            <span className="flex items-center gap-1.5 text-white/75">
              <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
              {p.name}
            </span>
            <span className="font-semibold tabular-nums">
              {money && typeof p.value === 'number' ? (privacy ? maskAmount(peso(p.value)) : peso(p.value)) : p.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
