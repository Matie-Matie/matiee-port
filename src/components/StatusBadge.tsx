import { PROJECT_STATUS_LABELS, type ProjectStatus } from '../types';
import { Badge, type BadgeTone } from '../ui/Badge';

const STATUS_TONE: Record<ProjectStatus, BadgeTone> = {
  pending: 'warn',
  'in-progress': 'brand',
  completed: 'ink',
  'on-hold': 'neutral',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <Badge tone={STATUS_TONE[status]} dot={status !== 'completed'}>
      {PROJECT_STATUS_LABELS[status]}
    </Badge>
  );
}
