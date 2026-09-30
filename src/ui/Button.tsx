import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { cn } from '../lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'soft' | 'dark';
type Size = 'sm' | 'md' | 'lg';

interface BaseProps {
  variant?: Variant;
  size?: Size;
  /** Icon before the label. */
  leading?: ReactNode;
  /** Nested trailing-icon island. `true` = arrow. */
  trailing?: ReactNode | true;
  className?: string;
  children?: ReactNode;
}

type ButtonProps = BaseProps & Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'className'>;
type LinkButtonProps = BaseProps & { to: string; onClick?: () => void; 'aria-label'?: string };

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-brand-600 text-white shadow-brand hover:bg-brand-700',
  dark: 'bg-ink text-white hover:bg-ink-2 shadow-[0_1px_0_rgb(255_255_255/0.12)_inset,0_10px_24px_-10px_rgb(15_26_20/0.7)]',
  secondary: 'bg-paper text-ink ring-1 ring-ink/10 shadow-hair hover:ring-ink/25',
  soft: 'bg-brand-50 text-brand-700 hover:bg-brand-100',
  ghost: 'text-ink-2 hover:bg-ink/[0.05]',
  danger: 'bg-danger-500 text-white hover:bg-danger-700 shadow-[0_8px_20px_-8px_rgb(192_67_43/0.6)]',
};

const SIZES: Record<Size, { base: string; withTrail: string; island: string }> = {
  sm: { base: 'h-9 px-4 text-[13px] gap-1.5', withTrail: 'pl-4 pr-1 gap-2', island: 'h-7 w-7' },
  md: { base: 'h-11 px-5 text-sm gap-2', withTrail: 'pl-5 pr-1.5 gap-3', island: 'h-8 w-8' },
  lg: { base: 'h-12 px-6 text-[15px] gap-2', withTrail: 'pl-6 pr-1.5 gap-3', island: 'h-9 w-9' },
};

function classes(variant: Variant, size: Size, trailing: boolean, extra?: string) {
  return cn(
    'group relative inline-flex select-none items-center justify-center whitespace-nowrap rounded-full font-medium',
    'transition-[transform,box-shadow,background-color,color] duration-500 ease-matie',
    'hover:-translate-y-px active:translate-y-0 active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-45',
    VARIANTS[variant],
    trailing ? SIZES[size].withTrail : SIZES[size].base,
    extra,
  );
}

function Island({ size, variant, children }: { size: Size; variant: Variant; children: ReactNode }) {
  const light = variant === 'secondary' || variant === 'soft' || variant === 'ghost';
  return (
    <span
      className={cn(
        'flex items-center justify-center rounded-full transition-transform duration-500 ease-matie',
        'group-hover:translate-x-0.5 group-hover:-translate-y-px group-hover:scale-105',
        SIZES[size].island,
        light ? 'bg-brand-600/10 text-brand-700' : 'bg-white/15 text-white',
      )}
    >
      {children}
    </span>
  );
}

function Content({ leading, trailing, size, variant, children }: Pick<BaseProps, 'leading' | 'trailing' | 'children'> & { size: Size; variant: Variant }) {
  return (
    <>
      {leading}
      <span>{children}</span>
      {trailing ? (
        <Island size={size} variant={variant}>
          {trailing === true ? <ArrowUpRight size={15} strokeWidth={1.75} /> : trailing}
        </Island>
      ) : null}
    </>
  );
}

export function Button({ variant = 'primary', size = 'md', leading, trailing, className, children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={classes(variant, size, Boolean(trailing), className)} {...rest}>
      <Content leading={leading} trailing={trailing} size={size} variant={variant}>
        {children}
      </Content>
    </button>
  );
}

export function LinkButton({ variant = 'primary', size = 'md', leading, trailing, className, children, to, onClick, ...rest }: LinkButtonProps) {
  return (
    <Link to={to} onClick={onClick} aria-label={rest['aria-label']} className={classes(variant, size, Boolean(trailing), className)}>
      <Content leading={leading} trailing={trailing} size={size} variant={variant}>
        {children}
      </Content>
    </Link>
  );
}

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  label: string;
  children: ReactNode;
  tone?: 'plain' | 'soft' | 'danger';
  size?: 'sm' | 'md';
}

export function IconButton({ label, children, tone = 'plain', size = 'md', className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full transition-[transform,background-color,color,box-shadow] duration-300 ease-matie active:scale-90',
        size === 'sm' ? 'h-8 w-8' : 'h-10 w-10',
        tone === 'plain' && 'bg-paper text-ink-2 ring-1 ring-ink/10 shadow-hair hover:text-ink hover:ring-ink/25',
        tone === 'soft' && 'bg-ink/[0.05] text-ink-2 hover:bg-ink/10 hover:text-ink',
        tone === 'danger' && 'bg-danger-100 text-danger-700 hover:bg-danger-500 hover:text-white',
        className,
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
