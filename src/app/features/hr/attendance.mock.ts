import { USERS } from '@/features/iam/iam.mock';
import type { AttendanceStatus, IAttendanceRecord } from './hr.types';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function setTime(date: Date, hh: number, mm: number): Date {
  const d = new Date(date);
  d.setHours(hh, mm, 0, 0);
  return d;
}

// Deterministic hash for (userId, date) so re-render keeps same status.
function hash(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0) / 4294967295;
}

function pickStatus(roll: number, dow: number): AttendanceStatus {
  // Skip Sunday entirely (no record for off-days handled by caller).
  if (dow === 0) return 'absent';
  if (roll < 0.7) return 'present';
  if (roll < 0.82) return 'late';
  if (roll < 0.88) return 'overtime';
  if (roll < 0.93) return 'half_day';
  if (roll < 0.97) return 'on_leave';
  return 'absent';
}

function generateRecord(userId: string, tenantId: string, date: Date): IAttendanceRecord | null {
  const dow = date.getDay();
  if (dow === 0) return null; // Sunday off
  const dateIso = isoDate(date);
  const roll = hash(`${userId}|${dateIso}`);
  const status = pickStatus(roll, dow);

  let checkInAt: string | null = null;
  let checkOutAt: string | null = null;
  let lateMinutes = 0;
  let overtimeMinutes = 0;

  if (status === 'present') {
    checkInAt = setTime(date, 7, 50 + Math.floor(roll * 10)).toISOString();
    checkOutAt = setTime(date, 17, Math.floor(roll * 20)).toISOString();
  } else if (status === 'late') {
    lateMinutes = 16 + Math.floor(roll * 45);
    checkInAt = setTime(date, 8, 15 + Math.floor(roll * 45)).toISOString();
    checkOutAt = setTime(date, 17, Math.floor(roll * 30)).toISOString();
  } else if (status === 'overtime') {
    overtimeMinutes = 60 + Math.floor(roll * 120);
    checkInAt = setTime(date, 7, 55).toISOString();
    checkOutAt = setTime(date, 18 + Math.floor(roll * 2), Math.floor(roll * 60)).toISOString();
  } else if (status === 'half_day') {
    checkInAt = setTime(date, 7, 55).toISOString();
    checkOutAt = setTime(date, 12, Math.floor(roll * 30)).toISOString();
  }

  return {
    id: `att-${userId}-${dateIso}`,
    userId,
    tenantId,
    date: dateIso,
    checkInAt,
    checkOutAt,
    status,
    lateMinutes,
    overtimeMinutes,
    note: null,
    editedBy: null,
    editedAt: null,
  };
}

function buildRange(now: Date): Date[] {
  // Past 45 days through next 5 days so calendar nav still has data both directions.
  const dates: Date[] = [];
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - 45);
  for (let i = 0; i < 51; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const NOW = new Date();
const RANGE = buildRange(NOW);

export const ATTENDANCE_RECORDS: IAttendanceRecord[] = USERS.flatMap((user) => {
  const tenantId = user.assignments[0]?.tenantId ?? 'tenant-hq';
  return RANGE.map((d) => generateRecord(user.id, tenantId, d)).filter(
    (r): r is IAttendanceRecord => r !== null,
  );
});

export function findAttendanceByUser(
  userId: string,
  year: number,
  month: number,
): IAttendanceRecord[] {
  const prefix = `${year}-${pad(month + 1)}`;
  return ATTENDANCE_RECORDS.filter((r) => r.userId === userId && r.date.startsWith(prefix));
}

export function findAttendanceByTenant(
  tenantId: string,
  year: number,
  month: number,
): IAttendanceRecord[] {
  const prefix = `${year}-${pad(month + 1)}`;
  return ATTENDANCE_RECORDS.filter((r) => r.tenantId === tenantId && r.date.startsWith(prefix));
}
