import { Link } from 'react-router-dom';
import logo from '../assets/user profile.jpg';
import { APP_NAME, APP_TAGLINE } from '../config';
import { R } from '../routes';

export function BrandMark({ size = 40 }: { size?: number }) {
  return (
    <span
      className="flex shrink-0 items-center justify-center overflow-hidden rounded-[14px] bg-white shadow-soft ring-1 ring-ink/10"
      style={{ width: size, height: size }}
    >
      <img src={logo} alt="" className="h-full w-full object-cover" />
    </span>
  );
}

export function Brand({ to = R.dashboard, onClick }: { to?: string; onClick?: () => void }) {
  return (
    <Link to={to} onClick={onClick} className="group flex items-center gap-3 rounded-2xl outline-offset-4" aria-label={`${APP_NAME} — ${APP_TAGLINE}`}>
      <span className="transition-transform duration-500 ease-matie group-hover:-rotate-6 group-hover:scale-105">
        <BrandMark />
      </span>
      <span className="min-w-0 leading-none">
        <span className="block text-[17px] font-semibold tracking-[-0.03em] text-ink">{APP_NAME}</span>
        <span className="mt-1 block text-[10px] font-semibold uppercase tracking-[0.2em] text-brand-600">{APP_TAGLINE}</span>
      </span>
    </Link>
  );
}
