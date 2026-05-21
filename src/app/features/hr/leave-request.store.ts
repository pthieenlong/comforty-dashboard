import { Injectable, computed, inject, signal } from '@angular/core';
import { simulateDelay } from '@/shared/utils';
import { AttendanceStore } from './attendance.store';
import { LEAVE_REQUESTS, datesBetween } from './leave-request.mock';
import { type ILeaveRequest, type LeaveStatus } from './hr.types';

export type LeaveCountByStatus = Record<LeaveStatus, number>;

function emptyCounts(): LeaveCountByStatus {
  return { pending: 0, approved: 0, rejected: 0, cancelled: 0 };
}

@Injectable({ providedIn: 'root' })
export class LeaveRequestStore {
  private readonly attendance = inject(AttendanceStore);
  private readonly _items = signal<ILeaveRequest[]>(LEAVE_REQUESTS);
  private readonly _saving = signal(false);

  readonly items = this._items.asReadonly();
  readonly saving = this._saving.asReadonly();

  readonly countByStatus = computed<LeaveCountByStatus>(() => {
    const out = emptyCounts();
    for (const r of this._items()) out[r.status] += 1;
    return out;
  });

  findById(id: string): ILeaveRequest | undefined {
    return this._items().find((r) => r.id === id);
  }

  findByUser(userId: string): ILeaveRequest[] {
    return this._items().filter((r) => r.userId === userId);
  }

  findByTenant(tenantId: string): ILeaveRequest[] {
    return this._items().filter((r) => r.tenantId === tenantId);
  }

  nextCode(): string {
    return `LR-${String(this._items().length + 1).padStart(4, '0')}`;
  }

  async submit(req: ILeaveRequest): Promise<ILeaveRequest> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 400);
      this._items.update((list) => [req, ...list]);
      return req;
    } finally {
      this._saving.set(false);
    }
  }

  async decide(
    id: string,
    approved: boolean,
    decidedBy: string,
    note: string | null,
  ): Promise<ILeaveRequest | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 400);
      const now = new Date().toISOString();
      const current = this.findById(id);
      if (!current) return null;
      const updated: ILeaveRequest = {
        ...current,
        status: approved ? 'approved' : 'rejected',
        decidedBy,
        decidedAt: now,
        decisionNote: note,
      };
      this._items.update((list) => list.map((r) => (r.id === id ? updated : r)));
      if (approved) {
        const dates = datesBetween(updated.fromDate, updated.toDate);
        this.attendance.applyLeaveDates(updated.userId, updated.tenantId, dates, decidedBy);
      }
      return updated;
    } finally {
      this._saving.set(false);
    }
  }

  async cancel(id: string): Promise<ILeaveRequest | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 150, 300);
      const current = this.findById(id);
      if (!current || current.status !== 'pending') return null;
      const updated: ILeaveRequest = { ...current, status: 'cancelled' };
      this._items.update((list) => list.map((r) => (r.id === id ? updated : r)));
      return updated;
    } finally {
      this._saving.set(false);
    }
  }
}
