import type { ReactNode } from 'react';
import { useMatieeStore } from '../store/matieeStore';

interface PrivateTextProps {
  children: ReactNode;
  type?: 'amount' | 'name';
  className?: string;
}

function maskText(raw: ReactNode, type: 'amount' | 'name'): string {
  const str = String(raw ?? '');
  if (!str) return str;
  if (type === 'amount') {
    const digits = str.replace(/[^0-9]/g, '').length || 4;
    return '₱' + '•'.repeat(Math.min(digits, 6));
  }
  const trimmed = str.trim();
  if (!trimmed) return str;
  return trimmed.charAt(0) + '•'.repeat(Math.min(trimmed.length - 1, 6));
}

export default function PrivateText({ children, type = 'amount', className = '' }: PrivateTextProps) {
  const privacyMode = useMatieeStore((s) => s.privacyMode);
  const raw = String(children ?? '');

  if (!privacyMode) {
    return <span className={className}>{children}</span>;
  }

  return (
    <span className={className} title={type === 'name' ? raw : undefined}>
      {maskText(children, type)}
    </span>
  );
}
