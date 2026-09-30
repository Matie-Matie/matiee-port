import { hashIndex } from '../lib/motion';
import { initials } from '../lib/format';
import { cn } from '../lib/cn';

// Earthy, all-dark-enough-for-white-text. Deliberately no purple / blue.
const PALETTE = ['#1c6f45', '#155c39', '#0f4a2e', '#a84d2e', '#8a5a08', '#556b2f', '#3c5a4c', '#7a4e2d'];

function avatarColor(name: string): string {
  return PALETTE[hashIndex(name || '?', PALETTE.length)];
}

export function Avatar({
  name,
  photo,
  size = 36,
  className,
}: {
  name: string;
  photo?: string;
  size?: number;
  className?: string;
}) {
  const style = { width: size, height: size, fontSize: Math.max(10, Math.round(size * 0.36)) };
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        style={style}
        className={cn('shrink-0 rounded-full object-cover ring-1 ring-ink/10', className)}
      />
    );
  }
  return (
    <span
      aria-hidden
      style={{ ...style, background: avatarColor(name) }}
      className={cn(
        'flex shrink-0 items-center justify-center rounded-full font-semibold tracking-tight text-white ring-1 ring-black/5',
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}
