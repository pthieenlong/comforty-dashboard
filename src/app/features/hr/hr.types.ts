export type AttendanceStatus = 'present' | 'late' | 'absent' | 'on_leave' | 'half_day' | 'overtime';

export interface IAttendanceRecord {
  id: string;
  userId: string;
  tenantId: string;
  date: string; // YYYY-MM-DD
  checkInAt: string | null; // ISO
  checkOutAt: string | null; // ISO
  status: AttendanceStatus;
  lateMinutes: number;
  overtimeMinutes: number;
  note: string | null;
  editedBy: string | null;
  editedAt: string | null;
}

export interface IAttendancePolicy {
  workStartTime: string; // HH:mm
  workEndTime: string; // HH:mm
  lateThresholdMinutes: number;
  halfDayHours: number;
}

export interface IAttendanceStatusMeta {
  label: string;
  short: string;
  dotClass: string;
  badgeClass: string;
  textClass: string;
}

export const ATTENDANCE_STATUS_META: Record<AttendanceStatus, IAttendanceStatusMeta> = {
  present: {
    label: 'Có mặt',
    short: 'CM',
    dotClass: 'bg-emerald-500',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    textClass: 'text-emerald-700',
  },
  late: {
    label: 'Đi trễ',
    short: 'T',
    dotClass: 'bg-amber-500',
    badgeClass: 'bg-amber-100 text-amber-700',
    textClass: 'text-amber-700',
  },
  absent: {
    label: 'Vắng',
    short: 'V',
    dotClass: 'bg-red-500',
    badgeClass: 'bg-red-100 text-red-700',
    textClass: 'text-red-700',
  },
  on_leave: {
    label: 'Nghỉ phép',
    short: 'P',
    dotClass: 'bg-indigo-500',
    badgeClass: 'bg-indigo-100 text-indigo-700',
    textClass: 'text-indigo-700',
  },
  half_day: {
    label: 'Nửa ngày',
    short: 'N',
    dotClass: 'bg-sky-500',
    badgeClass: 'bg-sky-100 text-sky-700',
    textClass: 'text-sky-700',
  },
  overtime: {
    label: 'Tăng ca',
    short: 'OT',
    dotClass: 'bg-violet-500',
    badgeClass: 'bg-violet-100 text-violet-700',
    textClass: 'text-violet-700',
  },
};

export const DEFAULT_ATTENDANCE_POLICY: IAttendancePolicy = {
  workStartTime: '08:00',
  workEndTime: '17:00',
  lateThresholdMinutes: 15,
  halfDayHours: 4,
};

// ===== Leave Request (Sprint 10b) =====

export type LeaveType = 'annual' | 'sick' | 'unpaid' | 'maternity' | 'compassionate';
export type LeaveStatus = 'pending' | 'approved' | 'rejected' | 'cancelled';
export type LeaveHalfDay = 'morning' | 'afternoon';

export interface ILeaveRequest {
  id: string;
  code: string;
  userId: string;
  tenantId: string;
  type: LeaveType;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  halfDay: LeaveHalfDay | null;
  reason: string;
  attachmentUrl: string | null;
  status: LeaveStatus;
  requestedAt: string;
  decidedBy: string | null;
  decidedAt: string | null;
  decisionNote: string | null;
}

export interface ILeaveTypeMeta {
  label: string;
  badgeClass: string;
}

export const LEAVE_TYPE_META: Record<LeaveType, ILeaveTypeMeta> = {
  annual: { label: 'Phép năm', badgeClass: 'bg-emerald-100 text-emerald-700' },
  sick: { label: 'Ốm', badgeClass: 'bg-rose-100 text-rose-700' },
  unpaid: { label: 'Không lương', badgeClass: 'bg-slate-100 text-slate-700' },
  maternity: { label: 'Thai sản', badgeClass: 'bg-pink-100 text-pink-700' },
  compassionate: { label: 'Hiếu hỉ', badgeClass: 'bg-amber-100 text-amber-700' },
};

export interface ILeaveStatusMeta {
  label: string;
  badgeClass: string;
}

export const LEAVE_STATUS_META: Record<LeaveStatus, ILeaveStatusMeta> = {
  pending: { label: 'Chờ duyệt', badgeClass: 'bg-amber-100 text-amber-700' },
  approved: { label: 'Đã duyệt', badgeClass: 'bg-emerald-100 text-emerald-700' },
  rejected: { label: 'Từ chối', badgeClass: 'bg-red-100 text-red-700' },
  cancelled: { label: 'Đã huỷ', badgeClass: 'bg-slate-100 text-slate-600' },
};
