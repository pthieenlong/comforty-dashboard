import { Injectable, computed, signal } from '@angular/core';
import { simulateDelay } from '@/shared/utils';
import { ATTENDANCE_RECORDS } from './attendance.mock';
import {
  ATTENDANCE_STATUS_META,
  DEFAULT_ATTENDANCE_POLICY,
  type AttendanceStatus,
  type IAttendanceRecord,
} from './hr.types';

export type AttendanceSummary = Record<AttendanceStatus, number>;

function emptySummary(): AttendanceSummary {
  return {
    present: 0,
    late: 0,
    absent: 0,
    on_leave: 0,
    half_day: 0,
    overtime: 0,
  };
}

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

export interface AttendanceUpdatePatch {
  checkInAt?: string | null;
  checkOutAt?: string | null;
  status?: AttendanceStatus;
  note?: string | null;
}

@Injectable({ providedIn: 'root' })
export class AttendanceStore {
  private readonly _records = signal<IAttendanceRecord[]>(ATTENDANCE_RECORDS);
  private readonly _policy = signal(DEFAULT_ATTENDANCE_POLICY);
  private readonly _saving = signal(false);

  readonly records = this._records.asReadonly();
  readonly policy = this._policy.asReadonly();
  readonly saving = this._saving.asReadonly();
  readonly statusMeta = ATTENDANCE_STATUS_META;

  readonly countByStatus = computed<AttendanceSummary>(() => {
    const out = emptySummary();
    for (const r of this._records()) {
      out[r.status] += 1;
    }
    return out;
  });

  findByUser(userId: string, year: number, month: number): IAttendanceRecord[] {
    const prefix = `${year}-${pad(month + 1)}`;
    return this._records().filter((r) => r.userId === userId && r.date.startsWith(prefix));
  }

  findByTenant(tenantId: string, year: number, month: number): IAttendanceRecord[] {
    const prefix = `${year}-${pad(month + 1)}`;
    return this._records().filter((r) => r.tenantId === tenantId && r.date.startsWith(prefix));
  }

  findById(id: string): IAttendanceRecord | undefined {
    return this._records().find((r) => r.id === id);
  }

  summaryByUser(userId: string, year: number, month: number): AttendanceSummary {
    const out = emptySummary();
    for (const r of this.findByUser(userId, year, month)) {
      out[r.status] += 1;
    }
    return out;
  }

  async updateRecord(
    id: string,
    patch: AttendanceUpdatePatch,
    editor: string,
  ): Promise<IAttendanceRecord | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 350);
      const now = new Date().toISOString();
      let updated: IAttendanceRecord | null = null;
      this._records.update((list) =>
        list.map((r) => {
          if (r.id !== id) return r;
          updated = {
            ...r,
            ...patch,
            editedBy: editor,
            editedAt: now,
          };
          return updated;
        }),
      );
      return updated;
    } finally {
      this._saving.set(false);
    }
  }

  /** Bulk create leave records when a leave request is approved (called from LeaveRequestStore). */
  applyLeaveDates(userId: string, tenantId: string, dateIsos: string[], editor: string): void {
    const now = new Date().toISOString();
    this._records.update((list) => {
      const out = [...list];
      for (const date of dateIsos) {
        const existingIdx = out.findIndex((r) => r.userId === userId && r.date === date);
        const record: IAttendanceRecord = {
          id: `att-${userId}-${date}`,
          userId,
          tenantId,
          date,
          checkInAt: null,
          checkOutAt: null,
          status: 'on_leave',
          lateMinutes: 0,
          overtimeMinutes: 0,
          note: 'Auto: leave approved',
          editedBy: editor,
          editedAt: now,
        };
        if (existingIdx >= 0) out[existingIdx] = record;
        else out.push(record);
      }
      return out;
    });
  }
}
