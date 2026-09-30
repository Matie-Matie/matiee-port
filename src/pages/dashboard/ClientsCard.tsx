import { Link } from 'react-router-dom';
import { ArrowUpRight, Users } from 'lucide-react';
import { useMatieeStore } from '../../store/matieeStore';
import { Card, CardHeader } from '../../ui/Card';
import { Avatar } from '../../ui/Avatar';
import { Badge } from '../../ui/Badge';
import { EmptyState } from '../../ui/EmptyState';
import { LinkButton } from '../../ui/Button';
import PrivateText from '../../components/PrivateText';
import { R } from '../../routes';

export function ClientsCard() {
  const clients = useMatieeStore((s) => s.clients);
  const projects = useMatieeStore((s) => s.projects);

  const rows = clients.slice(0, 4).map((c) => {
    const mine = projects.filter((p) => p.clientId === c.id);
    const done = mine.filter((p) => p.status === 'completed').length;
    const status = mine.length === 0 ? 'none' : done === mine.length ? 'done' : 'active';
    return { c, count: mine.length, status } as const;
  });

  return (
    <Card bezel spotlight pad="md">
      <CardHeader
        title="Clients"
        description={`${clients.length} in your vault`}
        action={
          <Link to={R.clients} aria-label="Open clients" className="flex h-8 w-8 items-center justify-center rounded-full bg-ink/[0.05] text-ink-2 transition-[background-color,transform] duration-300 ease-matie hover:bg-brand-600 hover:text-white active:scale-90">
            <ArrowUpRight size={15} strokeWidth={1.75} />
          </Link>
        }
      />
      {rows.length === 0 ? (
        <EmptyState compact icon={Users} title="No clients yet" description="Add your first client to start tracking projects." action={<LinkButton to={`${R.clients}?new=1`} variant="soft" size="sm">Add client</LinkButton>} />
      ) : (
        <ul className="-mx-2 space-y-0.5">
          {rows.map(({ c, count, status }) => (
            <li key={c.id}>
              <Link to={R.client(c.id)} className="flex items-center gap-3 rounded-2xl p-2 transition-colors duration-300 hover:bg-ink/[0.04]">
                <Avatar name={c.name} photo={c.photo} size={38} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] font-medium text-ink"><PrivateText type="name">{c.name}</PrivateText></span>
                  <span className="block text-xs text-mute">{count === 0 ? 'No projects yet' : `${count} project${count === 1 ? '' : 's'}`}</span>
                </span>
                <Badge tone={status === 'done' ? 'brand' : status === 'active' ? 'sand' : 'neutral'} dot>
                  {status === 'done' ? 'Complete' : status === 'active' ? 'Active' : 'New'}
                </Badge>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
