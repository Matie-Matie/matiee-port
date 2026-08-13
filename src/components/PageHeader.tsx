import Reveal from './Reveal';

interface PageHeaderProps {
  badge: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export default function PageHeader({ badge, title, description, action }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-8">
      <div>
        <Reveal y={15} duration={0.3}>
          <span className="inline-flex px-3 py-1 text-[10px] font-semibold tracking-[0.15em] uppercase text-green-dark bg-green-mint/50 rounded-full mb-3">
            {badge}
          </span>
        </Reveal>
        <Reveal y={15} delay={0.05} duration={0.3}>
          <h1 className="text-[32px] font-bold text-navy-900 leading-tight tracking-tight">
            {title}
          </h1>
        </Reveal>
        {description && (
          <Reveal y={10} delay={0.08} duration={0.3}>
            <p className="mt-1 text-sm text-gray-500 max-w-xl">{description}</p>
          </Reveal>
        )}
      </div>
      {action && (
        <Reveal y={10} delay={0.1} duration={0.3}>
          {action}
        </Reveal>
      )}
    </div>
  );
}
