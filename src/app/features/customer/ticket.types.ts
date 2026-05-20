export type TicketStatus =
  | 'open'
  | 'in_progress'
  | 'pending_customer'
  | 'resolved'
  | 'closed'
  | 'cancelled';

export type TicketType = 'exchange' | 'return' | 'complaint' | 'inquiry';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type EscalationLevel = 1 | 2 | 3;

export interface ITicketComment {
  id: string;
  occurredAt: string;
  authorId: string;
  authorName: string;
  authorType: 'customer' | 'staff';
  body: string;
  internal: boolean; // true = chỉ staff thấy
}

export type TicketEventAction =
  | 'created'
  | 'assigned'
  | 'status_changed'
  | 'priority_changed'
  | 'escalated'
  | 'commented'
  | 'resolved'
  | 'reopened';

export interface ITicketEvent {
  id: string;
  occurredAt: string;
  action: TicketEventAction;
  actor: string;
  details: string;
}

export interface ITicketLineItem {
  orderItemId: string;
  productId: string;
  productName: string;
  variantSku: string;
  variantLabel: string;
  quantity: number;
  reason: string;
  // Cho exchange: variant mong muốn đổi sang
  targetVariantSku: string | null;
}

export interface ITicket {
  id: string;
  code: string;
  type: TicketType;
  status: TicketStatus;
  priority: TicketPriority;
  subject: string;
  description: string;
  tenantId: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  orderId: string | null;
  orderCode: string | null;
  items: ITicketLineItem[];
  // Assignee = staff user id (từ IAM)
  assigneeId: string | null;
  assigneeName: string | null;
  escalationLevel: EscalationLevel;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  resolvedAt: string | null;
  closedAt: string | null;
  comments: ITicketComment[];
  events: ITicketEvent[];
}

// ─── Meta maps ───────────────────────────────────────────────────────────

export interface TicketStatusMeta {
  label: string;
  badgeVariant: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
  description: string;
}

export const TICKET_STATUS_META: Record<TicketStatus, TicketStatusMeta> = {
  open: {
    label: 'Mới',
    badgeVariant: 'info',
    description: 'Yêu cầu mới, chưa có nhân viên xử lý',
  },
  in_progress: {
    label: 'Đang xử lý',
    badgeVariant: 'warning',
    description: 'Nhân viên đang giải quyết',
  },
  pending_customer: {
    label: 'Chờ khách hàng',
    badgeVariant: 'warning',
    description: 'Đang chờ khách phản hồi thông tin',
  },
  resolved: {
    label: 'Đã xử lý',
    badgeVariant: 'success',
    description: 'Đã giải quyết, chờ khách xác nhận',
  },
  closed: {
    label: 'Đã đóng',
    badgeVariant: 'neutral',
    description: 'Yêu cầu đã hoàn tất',
  },
  cancelled: {
    label: 'Đã huỷ',
    badgeVariant: 'danger',
    description: 'Yêu cầu bị huỷ',
  },
};

export interface TicketTypeMeta {
  label: string;
  description: string;
}

export const TICKET_TYPE_META: Record<TicketType, TicketTypeMeta> = {
  exchange: {
    label: 'Đổi sản phẩm',
    description: 'Đổi sang size/màu/mẫu khác',
  },
  return: {
    label: 'Trả hàng',
    description: 'Trả hàng và hoàn tiền',
  },
  complaint: {
    label: 'Khiếu nại',
    description: 'Khiếu nại chất lượng sản phẩm hoặc dịch vụ',
  },
  inquiry: {
    label: 'Tư vấn',
    description: 'Yêu cầu tư vấn hoặc thông tin thêm',
  },
};

export interface TicketPriorityMeta {
  label: string;
  badgeVariant: 'neutral' | 'info' | 'warning' | 'danger';
}

export const TICKET_PRIORITY_META: Record<TicketPriority, TicketPriorityMeta> = {
  low: { label: 'Thấp', badgeVariant: 'neutral' },
  medium: { label: 'Trung bình', badgeVariant: 'info' },
  high: { label: 'Cao', badgeVariant: 'warning' },
  urgent: { label: 'Khẩn cấp', badgeVariant: 'danger' },
};

export const ESCALATION_LEVEL_META: Record<EscalationLevel, { label: string }> = {
  1: { label: 'Cấp 1 — Nhân viên' },
  2: { label: 'Cấp 2 — Quản lý chi nhánh' },
  3: { label: 'Cấp 3 — HQ Admin' },
};
