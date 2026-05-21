import { Injectable, computed, signal } from '@angular/core';
import { AUDIT_ENTRIES } from './audit.mock';
import type { AuditAction, AuditEntityType, IAuditEntry, IAuditFilter } from './audit.types';

const EMPTY_FILTER: IAuditFilter = {
  search: '',
  action: 'all',
  entityType: 'all',
  tenantId: 'all',
  actorId: 'all',
  dateFrom: null,
  dateTo: null,
};

@Injectable({ providedIn: 'root' })
export class AuditStore {
  private readonly _entries = signal<IAuditEntry[]>(AUDIT_ENTRIES);

  readonly entries = this._entries.asReadonly();
  readonly total = computed(() => this._entries().length);

  readonly countByAction = computed<Map<AuditAction, number>>(() => {
    const map = new Map<AuditAction, number>();
    for (const e of this._entries()) map.set(e.action, (map.get(e.action) ?? 0) + 1);
    return map;
  });

  readonly countByEntity = computed<Map<AuditEntityType, number>>(() => {
    const map = new Map<AuditEntityType, number>();
    for (const e of this._entries()) map.set(e.entityType, (map.get(e.entityType) ?? 0) + 1);
    return map;
  });

  findById(id: string): IAuditEntry | undefined {
    return this._entries().find((e) => e.id === id);
  }

  /** Pure filter, returns a new array. Sorted desc by occurredAt. */
  filterBy(filter: Partial<IAuditFilter>): IAuditEntry[] {
    const f: IAuditFilter = { ...EMPTY_FILTER, ...filter };
    const q = f.search.trim().toLowerCase();
    return this._entries().filter((e) => {
      if (q) {
        const hay = `${e.code} ${e.actorLabel} ${e.entityLabel} ${e.requestId}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      if (f.action !== 'all' && e.action !== f.action) return false;
      if (f.entityType !== 'all' && e.entityType !== f.entityType) return false;
      if (f.tenantId !== 'all' && e.tenantId !== f.tenantId) return false;
      if (f.actorId !== 'all' && e.actorId !== f.actorId) return false;
      if (f.dateFrom && e.occurredAt < f.dateFrom) return false;
      if (f.dateTo && e.occurredAt > `${f.dateTo}T23:59:59.999Z`) return false;
      return true;
    });
  }
}
