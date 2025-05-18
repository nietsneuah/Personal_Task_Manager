import Dexie from 'dexie';
import type { Table } from 'dexie';

export interface PriorityTask {
  id?: number;
  title: string;
  category: 'Primary' | 'Strategic' | 'Ongoing';
  impact: number;
  urgency: number;
  tenant: string;
  status: 'Planned' | 'In Progress' | 'Done';
  weekOf: string;
  notes?: string;
}

export class PriorityDB extends Dexie {
  tasks!: Table<PriorityTask>;
  constructor() {
    super('PriorityDatabase');
    this.version(1).stores({
      tasks: '++id, weekOf, category, tenant, status'
    });
  }
}

export const db = new PriorityDB();