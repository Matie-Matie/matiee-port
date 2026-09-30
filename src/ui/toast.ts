export type ToastTone = 'default' | 'success' | 'danger';
export interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

let items: ToastItem[] = [];
let counter = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export function subscribeToasts(fn: () => void): () => void {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
  };
}

export function getToasts(): ToastItem[] {
  return items;
}

export function dismissToast(id: number) {
  items = items.filter((t) => t.id !== id);
  emit();
}

/** Fire-and-forget feedback: toast('Client added', 'success'). */
export function toast(message: string, tone: ToastTone = 'default') {
  const id = ++counter;
  items = [...items.slice(-2), { id, message, tone }];
  emit();
  setTimeout(() => dismissToast(id), 3400);
}
