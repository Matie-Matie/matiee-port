import { useRef, type ChangeEvent } from 'react';
import { Camera, Trash2 } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
import { Field, Input, Textarea } from '../ui/Field';
import { fileToDataUrl } from '../lib/image';
import { toast } from '../ui/toast';
import type { ClientFormState } from './clientFormState';

export function ClientFields({
  value,
  onChange,
  onSubmit,
}: {
  value: ClientFormState;
  onChange: (v: ClientFormState) => void;
  onSubmit?: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);

  async function pick(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      onChange({ ...value, photo: await fileToDataUrl(file, 320) });
    } catch {
      toast('Could not read that image', 'danger');
    }
    e.target.value = '';
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          aria-label="Upload photo"
          className="group relative shrink-0 rounded-full outline-offset-2"
        >
          <Avatar name={value.name || '?'} photo={value.photo || undefined} size={64} />
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-ink/45 text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100">
            <Camera size={16} strokeWidth={1.75} />
          </span>
        </button>
        <div className="text-xs text-mute">
          <button type="button" onClick={() => fileRef.current?.click()} className="font-medium text-brand-700 hover:text-brand-800">
            {value.photo ? 'Change photo' : 'Upload photo'}
          </button>
          {value.photo && (
            <button type="button" onClick={() => onChange({ ...value, photo: '' })} className="ml-3 inline-flex items-center gap-1 font-medium text-faint hover:text-danger-700">
              <Trash2 size={12} strokeWidth={1.75} /> Remove
            </button>
          )}
          <p className="mt-0.5">Resized automatically to keep your vault light.</p>
        </div>
        <input ref={fileRef} type="file" accept="image/*" onChange={pick} className="hidden" aria-label="Choose photo" />
      </div>

      <Field label="Client name *">
        {(id) => (
          <Input
            id={id}
            data-autofocus
            value={value.name}
            onChange={(e) => onChange({ ...value, name: e.target.value })}
            onKeyDown={(e) => e.key === 'Enter' && onSubmit?.()}
            placeholder="e.g. Juan Dela Cruz"
          />
        )}
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Where to contact">
          {(id) => <Input id={id} value={value.contact} onChange={(e) => onChange({ ...value, contact: e.target.value })} placeholder="Facebook / Instagram link" />}
        </Field>
        <Field label="Email">
          {(id) => <Input id={id} type="email" value={value.email} onChange={(e) => onChange({ ...value, email: e.target.value })} placeholder="name@email.com" />}
        </Field>
      </div>
      <Field label="Notes">
        {(id) => <Textarea id={id} rows={3} value={value.notes} onChange={(e) => onChange({ ...value, notes: e.target.value })} placeholder="e.g. Prescription system — downpayment ₱5k" />}
      </Field>
    </div>
  );
}
