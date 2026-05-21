export type IncidentType =
  | 'equipment_failure'
  | 'theft_loss'
  | 'safety'
  | 'customer_dispute'
  | 'cash_discrepancy'
  | 'security'
  | 'other';

export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus =
  | 'reported'
  | 'acknowledged'
  | 'investigating'
  | 'resolved'
  | 'closed'
  | 'cancelled';

export type IncidentEscalationLevel = 1 | 2 | 3;

export interface IIncidentComment {
  id: string;
  authorId: string;
  body: string;
  createdAt: string;
}

export interface IIncidentEvent {
  id: string;
  occurredAt: string;
  actorId: string;
  kind:
    | 'created'
    | 'acknowledged'
    | 'investigating'
    | 'resolved'
    | 'closed'
    | 'cancelled'
    | 'assigned'
    | 'escalated'
    | 'severity_changed'
    | 'commented';
  note?: string;
}

export interface IIncident {
  id: string;
  code: string; // INC-2026-XXXX
  tenantId: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  title: string;
  description: string;
  occurredAt: string;
  location: string | null;
  reporterId: string;
  assigneeId: string | null;
  escalationLevel: IncidentEscalationLevel;
  attachments: string[];
  resolutionNote: string | null;
  resolvedAt: string | null;
  resolvedBy: string | null;
  createdAt: string;
  updatedAt: string;
  comments: IIncidentComment[];
  events: IIncidentEvent[];
}

export interface IIncidentTypeMeta {
  label: string;
  badgeClass: string;
}

export const INCIDENT_TYPE_META: Record<IncidentType, IIncidentTypeMeta> = {
  equipment_failure: { label: 'Thiết bị hỏng', badgeClass: 'bg-amber-100 text-amber-700' },
  theft_loss: { label: 'Mất hàng / Trộm cắp', badgeClass: 'bg-red-100 text-red-700' },
  safety: { label: 'An toàn lao động', badgeClass: 'bg-orange-100 text-orange-700' },
  customer_dispute: { label: 'Tranh chấp khách', badgeClass: 'bg-violet-100 text-violet-700' },
  cash_discrepancy: { label: 'Chênh lệch tiền mặt', badgeClass: 'bg-yellow-100 text-yellow-700' },
  security: { label: 'An ninh', badgeClass: 'bg-rose-100 text-rose-700' },
  other: { label: 'Khác', badgeClass: 'bg-slate-100 text-slate-700' },
};

export interface IIncidentSeverityMeta {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const INCIDENT_SEVERITY_META: Record<IncidentSeverity, IIncidentSeverityMeta> = {
  low: { label: 'Thấp', badgeClass: 'bg-slate-100 text-slate-700', dotClass: 'bg-slate-400' },
  medium: { label: 'Trung bình', badgeClass: 'bg-sky-100 text-sky-700', dotClass: 'bg-sky-500' },
  high: { label: 'Cao', badgeClass: 'bg-amber-100 text-amber-800', dotClass: 'bg-amber-500' },
  critical: {
    label: 'Nghiêm trọng',
    badgeClass: 'bg-red-100 text-red-700',
    dotClass: 'bg-red-500',
  },
};

export interface IIncidentStatusMeta {
  label: string;
  badgeClass: string;
}

export const INCIDENT_STATUS_META: Record<IncidentStatus, IIncidentStatusMeta> = {
  reported: { label: 'Mới báo', badgeClass: 'bg-blue-100 text-blue-700' },
  acknowledged: { label: 'Đã ghi nhận', badgeClass: 'bg-sky-100 text-sky-700' },
  investigating: { label: 'Đang điều tra', badgeClass: 'bg-amber-100 text-amber-700' },
  resolved: { label: 'Đã giải quyết', badgeClass: 'bg-emerald-100 text-emerald-700' },
  closed: { label: 'Đã đóng', badgeClass: 'bg-slate-100 text-slate-700' },
  cancelled: { label: 'Đã huỷ', badgeClass: 'bg-slate-100 text-slate-500' },
};
