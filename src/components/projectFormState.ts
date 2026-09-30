import type { Project, ProjectType } from '../types';

export const TYPE_OPTIONS: ProjectType[] = ['prescription', 'lending', 'inventory', 'attendance', 'other'];

export interface ProjectFormState {
  clientId: string;
  name: string;
  type: ProjectType;
  typeOther: string;
  description: string;
  deadline: string;
  fee: number;
  downpayment: number;
}

export const emptyProjectForm = (clientId = ''): ProjectFormState => ({
  clientId,
  name: '',
  type: 'other',
  typeOther: '',
  description: '',
  deadline: '',
  fee: 0,
  downpayment: 0,
});

export function projectFormFrom(p: Project): ProjectFormState {
  return {
    clientId: p.clientId,
    name: p.name,
    type: p.type,
    typeOther: p.typeOther ?? '',
    description: p.description,
    deadline: p.deadline,
    fee: p.fee,
    downpayment: p.downpayment,
  };
}

