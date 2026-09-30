import type { Client } from '../types';

export interface ClientFormState {
  name: string;
  contact: string;
  email: string;
  notes: string;
  photo: string;
}

export const emptyClientForm: ClientFormState = { name: '', contact: '', email: '', notes: '', photo: '' };

export function clientFormFrom(c: Client): ClientFormState {
  return { name: c.name, contact: c.contact, email: c.email, notes: c.notes, photo: c.photo ?? '' };
}

