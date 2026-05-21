import { USERS } from '@/features/iam/iam.mock';
import type { ILeaveRequest, LeaveStatus, LeaveType } from './hr.types';

const TYPES: LeaveType[] = ['annual', 'sick', 'unpaid', 'maternity', 'compassionate'];
const REASONS: Record<LeaveType, string[]> = {
  annual: ['Du lịch gia đình', 'Về quê', 'Việc cá nhân', 'Đám cưới bạn thân'],
  sick: [
    'Sốt cao',
    'Đau dạ dày, cần nghỉ dưỡng',
    'Mệt mỏi do làm việc liên tục',
    'Tái khám định kỳ',
  ],
  unpaid: ['Việc gia đình đột xuất', 'Hết phép năm nhưng cần đi xa', 'Chăm sóc người thân'],
  maternity: ['Sinh con đầu lòng', 'Sinh con thứ hai'],
  compassionate: ['Tang lễ người thân', 'Lễ kết hôn'],
};

const NOW = new Date();

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

function isoDate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function addDays(d: Date, days: number): Date {
  const out = new Date(d);
  out.setDate(out.getDate() + days);
  return out;
}

function pickStatus(idx: number): LeaveStatus {
  const mod = idx % 10;
  if (mod < 3) return 'pending';
  if (mod < 7) return 'approved';
  if (mod < 9) return 'rejected';
  return 'cancelled';
}

export const LEAVE_REQUESTS: ILeaveRequest[] = Array.from({ length: 40 }, (_, idx) => {
  const user = USERS[idx % USERS.length];
  const tenantId = user.assignments[0]?.tenantId ?? 'tenant-hq';
  const type = TYPES[idx % TYPES.length];
  const status = pickStatus(idx);
  const duration = type === 'maternity' ? 90 : type === 'sick' ? 1 + (idx % 3) : 1 + (idx % 5);
  const isHalfDay = duration === 1 && idx % 4 === 0 && type !== 'maternity';

  // Spread requests over the last 60 days.
  const requestedAt = addDays(NOW, -1 * (idx * 3));
  // Leave starts a few days after request.
  const fromDate = addDays(requestedAt, 5 + (idx % 7));
  const toDate = isHalfDay ? fromDate : addDays(fromDate, duration - 1);

  const decided = status === 'approved' || status === 'rejected';
  const decidedAt = decided ? addDays(requestedAt, 1 + (idx % 3)) : null;
  const reasonList = REASONS[type];
  const reason = reasonList[idx % reasonList.length];

  return {
    id: `lr-${String(idx + 1).padStart(3, '0')}`,
    code: `LR-${String(idx + 1).padStart(4, '0')}`,
    userId: user.id,
    tenantId,
    type,
    fromDate: isoDate(fromDate),
    toDate: isoDate(toDate),
    halfDay: isHalfDay ? (idx % 2 === 0 ? 'morning' : 'afternoon') : null,
    reason,
    attachmentUrl:
      type === 'sick' && idx % 3 === 0 ? 'https://placehold.co/600x400?text=Giay+kham' : null,
    status,
    requestedAt: requestedAt.toISOString(),
    decidedBy: decided ? USERS[(idx + 1) % USERS.length].id : null,
    decidedAt: decidedAt?.toISOString() ?? null,
    decisionNote: status === 'rejected' ? 'Không đủ điều kiện theo policy' : null,
  };
});

export function findLeaveRequest(id: string): ILeaveRequest | undefined {
  return LEAVE_REQUESTS.find((l) => l.id === id);
}

export function datesBetween(fromIso: string, toIso: string): string[] {
  const [fy, fm, fd] = fromIso.split('-').map(Number);
  const [ty, tm, td] = toIso.split('-').map(Number);
  const from = new Date(fy, fm - 1, fd);
  const to = new Date(ty, tm - 1, td);
  const out: string[] = [];
  for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
    out.push(isoDate(d));
  }
  return out;
}
