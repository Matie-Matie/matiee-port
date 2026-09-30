import { useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Bell, BellRing, CalendarClock, Check, Download, FileText, Paperclip, Pencil, Plus, Receipt, Trash2 } from 'lucide-react';
import { useMatieeStore } from '../../store/matieeStore';
import { PROJECT_TYPE_LABELS, type Project } from '../../types';
import { daysUntil, fmtBytes, fmtDate, fmtDateLong, todayStr } from '../../lib/format';
import { EASE } from '../../lib/motion';
import { cn } from '../../lib/cn';
import { Card } from '../../ui/Card';
import { Badge } from '../../ui/Badge';
import { Button, IconButton } from '../../ui/Button';
import { Field, Input, MoneyInput } from '../../ui/Field';
import { Money } from '../../ui/Money';
import { Segmented } from '../../ui/Segmented';
import { ConfirmDialog } from '../../ui/ConfirmDialog';
import { toast } from '../../ui/toast';
import { ProjectStatusBadge } from '../../components/StatusBadge';

type Tab = 'none' | 'payments' | 'files';

export function ProjectPanel({ project, onEdit, onDelete }: { project: Project; onEdit: () => void; onDelete: () => void }) {
  const allPayments = useMatieeStore((s) => s.payments);
  const allFiles = useMatieeStore((s) => s.attachments);
  const payments = useMemo(() => allPayments.filter((p) => p.projectId === project.id), [allPayments, project.id]);
  const files = useMemo(() => allFiles.filter((a) => a.projectId === project.id), [allFiles, project.id]);
  const updateProject = useMatieeStore((s) => s.updateProject);
  const addPayment = useMatieeStore((s) => s.addPayment);
  const deletePayment = useMatieeStore((s) => s.deletePayment);
  const addAttachment = useMatieeStore((s) => s.addAttachment);
  const deleteAttachment = useMatieeStore((s) => s.deleteAttachment);

  const [tab, setTab] = useState<Tab>('none');
  const [payForm, setPayForm] = useState({ amount: 0, date: todayStr(), notes: '' });
  const [fileToRemove, setFileToRemove] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const paid = payments.reduce((s, p) => s + p.amount, 0);
  const remaining = project.remainingPaid ? 0 : Math.max(0, project.fee - paid);
  const days = daysUntil(project.deadline);
  const overdue = project.status !== 'completed' && days !== null && days < 0;
  const soon = project.status !== 'completed' && days !== null && days >= 0 && days <= 3;

  function submitPayment() {
    if (!payForm.amount || !payForm.date) return;
    addPayment({ projectId: project.id, amount: payForm.amount, date: payForm.date, notes: payForm.notes.trim() });
    setPayForm({ amount: 0, date: todayStr(), notes: '' });
    toast('Payment recorded', 'success');
  }

  function onPickFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast('That file is over 4 MB — keep files small so your vault stays light', 'danger');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      addAttachment(project.id, { name: file.name, type: file.type, size: file.size, data: reader.result as string });
      toast('File attached', 'success');
    };
    reader.readAsDataURL(file);
  }

  function download(a: { name: string; data: string }) {
    const link = document.createElement('a');
    link.href = a.data;
    link.download = a.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const removing = files.find((f) => f.id === fileToRemove);

  return (
    <Card bezel spotlight pad="none" coreClassName="flex flex-col">
      <div className="p-5 md:p-6">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="mb-2.5 flex flex-wrap items-center gap-2">
              <ProjectStatusBadge status={project.status} />
              {project.status === 'completed' && !project.remainingPaid && <Badge tone="danger">Unpaid</Badge>}
            </div>
            <h3 className="text-[17px] font-semibold leading-snug tracking-tight text-ink">{project.name}</h3>
            <p className="mt-0.5 text-[13px] text-mute">
              {PROJECT_TYPE_LABELS[project.type]}
              {project.type === 'other' && project.typeOther ? ` — ${project.typeOther}` : ''}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <IconButton
              size="sm"
              tone="soft"
              label={project.reminder ? 'Remove reminder' : 'Set reminder'}
              aria-pressed={project.reminder}
              className={cn(project.reminder && '!bg-warn-100 !text-warn-700')}
              onClick={() => updateProject(project.id, { reminder: !project.reminder })}
            >
              {project.reminder ? <BellRing size={14} strokeWidth={1.75} /> : <Bell size={14} strokeWidth={1.75} />}
            </IconButton>
            <IconButton size="sm" tone="soft" label={`Edit ${project.name}`} onClick={onEdit}>
              <Pencil size={14} strokeWidth={1.75} />
            </IconButton>
            <IconButton size="sm" tone="danger" label={`Delete ${project.name}`} onClick={onDelete}>
              <Trash2 size={14} strokeWidth={1.75} />
            </IconButton>
          </div>
        </div>

        {project.description && <p className="mt-3 text-sm leading-relaxed text-mute">{project.description}</p>}

        {/* Progress — a real slider */}
        <div className="mt-5">
          <div className="mb-2 flex items-center justify-between text-xs">
            <label htmlFor={`prog-${project.id}`} className="text-mute">Progress</label>
            <span className="font-semibold tabular-nums text-ink">{project.progress}%</span>
          </div>
          <input
            id={`prog-${project.id}`}
            type="range"
            min={0}
            max={100}
            step={5}
            value={project.progress}
            onChange={(e) => updateProject(project.id, { progress: Number(e.target.value) })}
            className="range"
            style={{ ['--v' as string]: `${project.progress}%` }}
          />
        </div>

        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-ink/[0.07] pt-5 md:grid-cols-4">
          <div>
            <dt className="text-[11px] text-mute">Fee</dt>
            <dd className="mt-0.5 text-[15px] font-semibold tracking-tight text-ink"><Money value={project.fee} /></dd>
          </div>
          <div>
            <dt className="text-[11px] text-mute">Paid</dt>
            <dd className="mt-0.5 text-[15px] font-semibold tracking-tight text-brand-700"><Money value={paid} /></dd>
          </div>
          <div>
            <dt className="text-[11px] text-mute">Remaining</dt>
            <dd className={cn('mt-0.5 text-[15px] font-semibold tracking-tight', project.remainingPaid ? 'text-brand-700' : remaining > 0 ? 'text-warn-700' : 'text-ink')}>
              {project.remainingPaid ? 'Settled' : <Money value={remaining} />}
            </dd>
          </div>
          <div>
            <dt className="text-[11px] text-mute">Deadline</dt>
            <dd className="mt-0.5">
              {project.deadline ? (
                <Badge tone={overdue ? 'danger' : soon ? 'warn' : 'neutral'}>
                  <CalendarClock size={11} strokeWidth={1.75} />
                  {overdue ? `${Math.abs(days as number)}d overdue` : fmtDate(project.deadline)}
                </Badge>
              ) : (
                <span className="text-sm text-mute">Not set</span>
              )}
            </dd>
          </div>
        </dl>

        {/* Payment status toggles (these drive the dashboard's Revenue number) */}
        {(project.downpayment > 0 || project.status === 'completed') && (
          <div className="mt-5 space-y-2">
            {project.downpayment > 0 && (
              <ToggleRow
                label="Downpayment"
                amount={project.downpayment}
                on={project.downpaymentPaid}
                onLabel="Received"
                offLabel="Pending"
                onToggle={() => updateProject(project.id, { downpaymentPaid: !project.downpaymentPaid })}
              />
            )}
            {project.status === 'completed' && (
              <ToggleRow
                label="Final payment"
                amount={project.fee - project.downpayment}
                on={project.remainingPaid}
                onLabel="Received"
                offLabel="Unpaid"
                onToggle={() => updateProject(project.id, { remainingPaid: !project.remainingPaid })}
              />
            )}
          </div>
        )}
      </div>

      <div className="border-t border-ink/[0.07] bg-paper-2/70 px-5 py-3 md:px-6">
        <Segmented<Tab>
          ariaLabel="Project details"
          size="sm"
          value={tab}
          onChange={(v) => setTab(tab === v ? 'none' : v)}
          options={[
            { value: 'payments', label: <><Receipt size={13} strokeWidth={1.75} /> Payments</>, count: payments.length },
            { value: 'files', label: <><Paperclip size={13} strokeWidth={1.75} /> Files</>, count: files.length },
          ]}
        />
      </div>

      <AnimatePresence initial={false}>
        {tab !== 'none' && (
          <motion.div
            key={tab}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
            className="overflow-hidden bg-paper-2/70"
          >
            <div className="px-5 pb-5 pt-1 md:px-6">
              {tab === 'payments' && (
                <div>
                  {payments.length === 0 ? (
                    <p className="py-3 text-sm text-mute">No payments recorded yet.</p>
                  ) : (
                    <ul className="mb-4 space-y-1.5">
                      {[...payments].reverse().map((p) => (
                        <li key={p.id} className="flex items-center gap-3 rounded-2xl bg-paper px-3.5 py-2.5 ring-1 ring-ink/[0.05]">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600"><Receipt size={15} strokeWidth={1.6} /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block text-sm font-semibold tabular-nums text-ink"><Money value={p.amount} /></span>
                            <span className="block truncate text-xs text-mute">{fmtDateLong(p.date)}{p.notes ? ` — ${p.notes}` : ''}</span>
                          </span>
                          <IconButton size="sm" tone="danger" label="Delete payment" onClick={() => { deletePayment(p.id); toast('Payment removed'); }}>
                            <Trash2 size={13} strokeWidth={1.75} />
                          </IconButton>
                        </li>
                      ))}
                    </ul>
                  )}
                  <form
                    onSubmit={(e) => { e.preventDefault(); submitPayment(); }}
                    className="grid grid-cols-1 gap-3 rounded-2xl bg-paper p-3.5 ring-1 ring-ink/[0.05] sm:grid-cols-[1fr_1fr] md:grid-cols-[130px_150px_1fr_auto]"
                  >
                    <Field label="Amount">{(id) => <MoneyInput id={id} value={payForm.amount || ''} onChange={(e) => setPayForm({ ...payForm, amount: Number(e.target.value) })} placeholder="0" />}</Field>
                    <Field label="Date">{(id) => <Input id={id} type="date" value={payForm.date} onChange={(e) => setPayForm({ ...payForm, date: e.target.value })} />}</Field>
                    <Field label="Note" className="sm:col-span-2 md:col-span-1">{(id) => <Input id={id} value={payForm.notes} onChange={(e) => setPayForm({ ...payForm, notes: e.target.value })} placeholder="Optional" />}</Field>
                    <div className="flex items-end sm:col-span-2 md:col-span-1">
                      <Button type="submit" size="md" leading={<Plus size={15} strokeWidth={2} />} disabled={!payForm.amount || !payForm.date} className="w-full">Add</Button>
                    </div>
                  </form>
                </div>
              )}

              {tab === 'files' && (
                <div>
                  <input ref={fileRef} type="file" accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.txt,.zip" className="hidden" onChange={onPickFile} aria-label="Choose file to attach" />
                  {files.length > 0 && (
                    <ul className="mb-3 space-y-1.5">
                      {files.map((a) => (
                        <li key={a.id} className="flex items-center gap-3 rounded-2xl bg-paper px-3.5 py-2.5 ring-1 ring-ink/[0.05]">
                          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-ink/[0.05] text-ink-2"><FileText size={15} strokeWidth={1.6} /></span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate text-sm font-medium text-ink">{a.name}</span>
                            <span className="block text-xs text-mute">{fmtBytes(a.size)}</span>
                          </span>
                          <IconButton size="sm" tone="soft" label={`Download ${a.name}`} onClick={() => download(a)}><Download size={14} strokeWidth={1.75} /></IconButton>
                          <IconButton size="sm" tone="danger" label={`Remove ${a.name}`} onClick={() => setFileToRemove(a.id)}><Trash2 size={14} strokeWidth={1.75} /></IconButton>
                        </li>
                      ))}
                    </ul>
                  )}
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-brand-600/30 bg-brand-50/50 py-4 text-sm font-medium text-brand-700 transition-colors hover:bg-brand-50"
                  >
                    <Plus size={16} strokeWidth={2} /> Attach a file <span className="text-xs font-normal text-mute">· up to 4 MB</span>
                  </button>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <ConfirmDialog
        open={fileToRemove !== null}
        onClose={() => setFileToRemove(null)}
        title={`Remove “${removing?.name ?? 'file'}”?`}
        description="The file is deleted from this vault. This can't be undone."
        confirmLabel="Remove"
        onConfirm={() => { if (fileToRemove) deleteAttachment(fileToRemove); toast('File removed'); }}
      />
    </Card>
  );
}

function ToggleRow({
  label,
  amount,
  on,
  onLabel,
  offLabel,
  onToggle,
}: {
  label: string;
  amount: number;
  on: boolean;
  onLabel: string;
  offLabel: string;
  onToggle: () => void;
}) {
  return (
    <div className={cn('flex items-center gap-3 rounded-2xl px-3.5 py-2.5 ring-1', on ? 'bg-brand-50/70 ring-brand-600/15' : 'bg-paper-2 ring-ink/[0.06]')}>
      <span className={cn('flex h-6 w-6 shrink-0 items-center justify-center rounded-full', on ? 'bg-brand-600 text-white' : 'bg-ink/[0.08] text-mute')}>
        <Check size={13} strokeWidth={2.5} />
      </span>
      <span className="min-w-0 flex-1 text-[13px]">
        <span className="font-medium text-ink">{label}</span>
        <span className="text-mute"> · <Money value={Math.max(0, amount)} /></span>
      </span>
      <Badge tone={on ? 'brand' : 'warn'}>{on ? onLabel : offLabel}</Badge>
      <Button size="sm" variant={on ? 'ghost' : 'soft'} onClick={onToggle}>{on ? 'Undo' : 'Mark received'}</Button>
    </div>
  );
}
