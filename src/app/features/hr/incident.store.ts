import { Injectable, computed, signal } from '@angular/core';
import { simulateDelay } from '@/shared/utils';
import { INCIDENTS } from './incident.mock';
import type {
  IIncident,
  IIncidentComment,
  IIncidentEvent,
  IncidentEscalationLevel,
  IncidentSeverity,
  IncidentStatus,
} from './incident.types';

export type IncidentCountByStatus = Record<IncidentStatus, number>;
export type IncidentCountBySeverity = Record<IncidentSeverity, number>;

function emptyStatusCounts(): IncidentCountByStatus {
  return {
    reported: 0,
    acknowledged: 0,
    investigating: 0,
    resolved: 0,
    closed: 0,
    cancelled: 0,
  };
}

function emptySeverityCounts(): IncidentCountBySeverity {
  return { low: 0, medium: 0, high: 0, critical: 0 };
}

@Injectable({ providedIn: 'root' })
export class IncidentStore {
  private readonly _items = signal<IIncident[]>(INCIDENTS);
  private readonly _saving = signal(false);

  readonly items = this._items.asReadonly();
  readonly saving = this._saving.asReadonly();

  readonly countByStatus = computed<IncidentCountByStatus>(() => {
    const out = emptyStatusCounts();
    for (const i of this._items()) out[i.status] += 1;
    return out;
  });

  readonly countBySeverity = computed<IncidentCountBySeverity>(() => {
    const out = emptySeverityCounts();
    for (const i of this._items()) out[i.severity] += 1;
    return out;
  });

  findById(id: string): IIncident | undefined {
    return this._items().find((i) => i.id === id);
  }

  findByTenant(tenantId: string): IIncident[] {
    return this._items().filter((i) => i.tenantId === tenantId);
  }

  findByAssignee(userId: string): IIncident[] {
    return this._items().filter((i) => i.assigneeId === userId);
  }

  findByReporter(userId: string): IIncident[] {
    return this._items().filter((i) => i.reporterId === userId);
  }

  nextCode(): string {
    const seq = this._items().length + 1;
    return `INC-2026-${String(seq).padStart(4, '0')}`;
  }

  private mutate(id: string, mutator: (i: IIncident) => IIncident): IIncident | null {
    const current = this.findById(id);
    if (!current) return null;
    const next = mutator(current);
    this._items.update((list) => list.map((i) => (i.id === id ? next : i)));
    return next;
  }

  private appendEvent(i: IIncident, evt: Omit<IIncidentEvent, 'id'>): IIncident {
    const id = `${i.id}-evt-${i.events.length + 1}`;
    return {
      ...i,
      events: [...i.events, { ...evt, id }],
      updatedAt: evt.occurredAt,
    };
  }

  async transition(
    id: string,
    next: IncidentStatus,
    actorId: string,
    note?: string,
  ): Promise<IIncident | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 350);
      return this.mutate(id, (i) => {
        const occurredAt = new Date().toISOString();
        const kindMap: Record<IncidentStatus, IIncidentEvent['kind']> = {
          reported: 'created',
          acknowledged: 'acknowledged',
          investigating: 'investigating',
          resolved: 'resolved',
          closed: 'closed',
          cancelled: 'cancelled',
        };
        let updated = { ...i, status: next };
        if (next === 'resolved') {
          updated = {
            ...updated,
            resolvedAt: occurredAt,
            resolvedBy: actorId,
            resolutionNote: note ?? null,
          };
        }
        return this.appendEvent(updated, {
          occurredAt,
          actorId,
          kind: kindMap[next],
          note,
        });
      });
    } finally {
      this._saving.set(false);
    }
  }

  async assign(id: string, assigneeId: string, actorId: string): Promise<IIncident | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 150, 300);
      return this.mutate(id, (i) =>
        this.appendEvent(
          { ...i, assigneeId },
          {
            occurredAt: new Date().toISOString(),
            actorId,
            kind: 'assigned',
          },
        ),
      );
    } finally {
      this._saving.set(false);
    }
  }

  async escalate(
    id: string,
    level: IncidentEscalationLevel,
    actorId: string,
    reason: string,
  ): Promise<IIncident | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 150, 300);
      return this.mutate(id, (i) =>
        this.appendEvent(
          { ...i, escalationLevel: level },
          {
            occurredAt: new Date().toISOString(),
            actorId,
            kind: 'escalated',
            note: `Cấp ${level}: ${reason}`,
          },
        ),
      );
    } finally {
      this._saving.set(false);
    }
  }

  async setSeverity(
    id: string,
    severity: IncidentSeverity,
    actorId: string,
  ): Promise<IIncident | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 100, 200);
      return this.mutate(id, (i) =>
        this.appendEvent(
          { ...i, severity },
          {
            occurredAt: new Date().toISOString(),
            actorId,
            kind: 'severity_changed',
            note: `→ ${severity}`,
          },
        ),
      );
    } finally {
      this._saving.set(false);
    }
  }

  async addComment(id: string, authorId: string, body: string): Promise<IIncident | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 100, 200);
      return this.mutate(id, (i) => {
        const now = new Date().toISOString();
        const comment: IIncidentComment = {
          id: `${i.id}-cmt-${i.comments.length + 1}`,
          authorId,
          body,
          createdAt: now,
        };
        return this.appendEvent(
          { ...i, comments: [...i.comments, comment] },
          { occurredAt: now, actorId: authorId, kind: 'commented' },
        );
      });
    } finally {
      this._saving.set(false);
    }
  }

  async createIncident(i: IIncident): Promise<IIncident> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 250, 500);
      this._items.update((list) => [i, ...list]);
      return i;
    } finally {
      this._saving.set(false);
    }
  }
}
