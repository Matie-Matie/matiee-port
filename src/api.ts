const BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  // The json-server mirror is an opt-in dev convenience (VITE_API_SYNC=true
  // with `npm run dev:db`). By default — and always in production builds —
  // nothing is sent anywhere: the vault is local-only.
  if (!import.meta.env.DEV || import.meta.env.VITE_API_SYNC !== 'true') throw new Error('API sync is disabled');
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ── Generic CRUD ──

export function getAll<T>(resource: string): Promise<T[]> {
  return request<T[]>(`/${resource}`);
}

export function getById<T>(resource: string, id: string): Promise<T> {
  return request<T>(`/${resource}/${id}`);
}

export function create<T>(resource: string, data: Partial<T>): Promise<T> {
  return request<T>(`/${resource}`, { method: 'POST', body: JSON.stringify(data) });
}

export function update<T>(resource: string, id: string, data: Partial<T>): Promise<T> {
  return request<T>(`/${resource}/${id}`, { method: 'PATCH', body: JSON.stringify(data) });
}

export function remove<T>(resource: string, id: string): Promise<T> {
  return request<T>(`/${resource}/${id}`, { method: 'DELETE' });
}
