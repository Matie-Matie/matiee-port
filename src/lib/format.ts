export function peso(n: number): string {
  const sign = n < 0 ? '-' : '';
  return sign + '₱' + Math.abs(Math.round(n)).toLocaleString('en-US');
}

/** ₱1.2K / ₱3.4M — for tight spaces and chart axes. */
export function pesoCompact(n: number): string {
  const abs = Math.abs(n);
  const sign = n < 0 ? '-' : '';
  if (abs >= 1_000_000) return `${sign}₱${(abs / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`;
  if (abs >= 10_000) return `${sign}₱${(abs / 1_000).toFixed(0)}K`;
  if (abs >= 1_000) return `${sign}₱${(abs / 1_000).toFixed(1).replace(/\.0$/, '')}K`;
  return `${sign}₱${Math.round(abs)}`;
}

export function fmtDate(d: string | Date | undefined, opts?: Intl.DateTimeFormatOptions): string {
  if (!d) return '';
  const date = typeof d === 'string' ? new Date(d.length === 10 ? d + 'T00:00:00' : d) : d;
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', opts ?? { month: 'short', day: 'numeric' });
}

export function fmtDateLong(d: string | Date | undefined): string {
  return fmtDate(d, { month: 'short', day: 'numeric', year: 'numeric' });
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return '?';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function greeting(now = new Date()): string {
  const h = now.getHours();
  if (h < 5) return 'Still up';
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

/** Days from today (local midnight) to a YYYY-MM-DD deadline. Negative = overdue. */
export function daysUntil(deadline: string | undefined): number | null {
  if (!deadline) return null;
  const d = new Date(deadline.length === 10 ? deadline + 'T00:00:00' : deadline);
  if (Number.isNaN(d.getTime())) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  d.setHours(0, 0, 0, 0);
  return Math.round((d.getTime() - today.getTime()) / 86_400_000);
}

export function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Local-time YYYY-MM-DD (toISOString would give the UTC date). */
export function todayStr(d: Date = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function timeAgo(ts: number): string {
  const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
  if (s < 60) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  if (d < 30) return `${d}d ago`;
  return `${Math.round(d / 30)}mo ago`;
}

/** Mask a ₱ amount the same way PrivateText does. */
export function maskAmount(formatted: string): string {
  const digits = formatted.replace(/[^0-9]/g, '').length || 4;
  return '₱' + '•'.repeat(Math.min(digits, 6));
}

/** First letter + dots — the same masking PrivateText applies to names. */
export function maskName(raw: string): string {
  const t = raw.trim();
  if (!t) return raw;
  return t.charAt(0) + '•'.repeat(Math.min(t.length - 1, 6));
}
