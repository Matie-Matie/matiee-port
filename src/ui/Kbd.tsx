import type { ReactNode } from 'react';
import { cn } from '../lib/cn';

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-5 min-w-5 items-center justify-center rounded-md bg-paper px-1.5 font-mono text-[10px] font-medium text-mute shadow-[0_1px_0_rgb(15_26_20/0.12),0_0_0_1px_rgb(15_26_20/0.08)]',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
