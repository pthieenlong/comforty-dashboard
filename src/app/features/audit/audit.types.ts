export type AuditAction =
  // Order
  | 'order.create'
  | 'order.transition'
  | 'order.cancel'
  | 'refund.create'
  // Payment
  | 'payment.capture'
  // Marketing
  | 'campaign.create'
  | 'campaign.transition'
  | 'promotion.create'
  | 'voucher.batch.create'
  // Catalog
  | 'product.create'
  | 'product.update'
  | 'category.create'
  | 'brand.create'
  // Inventory
  | 'inventory.transfer.create'
  | 'inventory.transfer.transition'
  | 'inventory.stock_take.create'
  | 'inventory.stock_take.complete'
  // CRM
  | 'review.moderate'
  | 'ticket.transition'
  | 'inquiry.reply'
  // IAM
  | 'user.create'
  | 'user.update'
  | 'role.assign'
  // HR
  | 'leave.submit'
  | 'leave.decide'
  | 'incident.create'
  | 'incident.transition'
  | 'incident.escalate'
  | 'attendance.edit'
  // Auth / system
  | 'login.success'
  | 'login.failed'
  | 'tenant.switch';

export type AuditEntityType =
  | 'order'
  | 'refund'
  | 'payment'
  | 'campaign'
  | 'promotion'
  | 'voucher_batch'
  | 'product'
  | 'category'
  | 'brand'
  | 'inventory_transfer'
  | 'stock_take'
  | 'review'
  | 'ticket'
  | 'inquiry'
  | 'user'
  | 'role'
  | 'leave_request'
  | 'incident'
  | 'attendance'
  | 'tenant'
  | 'session';

export type AuditSeverity = 'info' | 'success' | 'warning' | 'danger';

export interface IAuditChange {
  field: string;
  before: unknown;
  after: unknown;
  /** Optional display override; otherwise we stringify before/after. */
  display?: string;
}

export interface IAuditEntry {
  id: string;
  code: string; // AUD-2026-XXXXXX
  occurredAt: string;
  actorId: string;
  actorLabel: string;
  actorRole: string;
  tenantId: string | null;
  action: AuditAction;
  entityType: AuditEntityType;
  entityId: string;
  entityLabel: string;
  requestId: string;
  ipAddress: string;
  userAgent: string | null;
  changes: IAuditChange[];
  /** Free-form context: order code, parent ID, related links. */
  metadata: Record<string, string | number | boolean | null>;
}

export interface IAuditActionMeta {
  label: string;
  entity: AuditEntityType;
  severity: AuditSeverity;
  badgeClass: string;
}

export const ACTION_META: Record<AuditAction, IAuditActionMeta> = {
  'order.create': {
    label: 'Tạo đơn',
    entity: 'order',
    severity: 'success',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  'order.transition': {
    label: 'Đổi trạng thái đơn',
    entity: 'order',
    severity: 'info',
    badgeClass: 'bg-sky-100 text-sky-700',
  },
  'order.cancel': {
    label: 'Huỷ đơn',
    entity: 'order',
    severity: 'danger',
    badgeClass: 'bg-red-100 text-red-700',
  },
  'refund.create': {
    label: 'Hoàn hàng',
    entity: 'refund',
    severity: 'warning',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  'payment.capture': {
    label: 'Ghi nhận thanh toán',
    entity: 'payment',
    severity: 'success',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  'campaign.create': {
    label: 'Tạo chiến dịch',
    entity: 'campaign',
    severity: 'info',
    badgeClass: 'bg-indigo-100 text-indigo-700',
  },
  'campaign.transition': {
    label: 'Đổi trạng thái chiến dịch',
    entity: 'campaign',
    severity: 'info',
    badgeClass: 'bg-indigo-100 text-indigo-700',
  },
  'promotion.create': {
    label: 'Tạo khuyến mãi',
    entity: 'promotion',
    severity: 'info',
    badgeClass: 'bg-pink-100 text-pink-700',
  },
  'voucher.batch.create': {
    label: 'Tạo lô voucher',
    entity: 'voucher_batch',
    severity: 'info',
    badgeClass: 'bg-violet-100 text-violet-700',
  },
  'product.create': {
    label: 'Tạo sản phẩm',
    entity: 'product',
    severity: 'success',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  'product.update': {
    label: 'Sửa sản phẩm',
    entity: 'product',
    severity: 'info',
    badgeClass: 'bg-sky-100 text-sky-700',
  },
  'category.create': {
    label: 'Tạo danh mục',
    entity: 'category',
    severity: 'info',
    badgeClass: 'bg-sky-100 text-sky-700',
  },
  'brand.create': {
    label: 'Tạo thương hiệu',
    entity: 'brand',
    severity: 'info',
    badgeClass: 'bg-sky-100 text-sky-700',
  },
  'inventory.transfer.create': {
    label: 'Tạo điều chuyển kho',
    entity: 'inventory_transfer',
    severity: 'info',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  'inventory.transfer.transition': {
    label: 'Đổi trạng thái điều chuyển',
    entity: 'inventory_transfer',
    severity: 'info',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  'inventory.stock_take.create': {
    label: 'Tạo phiên kiểm kê',
    entity: 'stock_take',
    severity: 'info',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  'inventory.stock_take.complete': {
    label: 'Hoàn tất kiểm kê',
    entity: 'stock_take',
    severity: 'success',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  'review.moderate': {
    label: 'Duyệt đánh giá',
    entity: 'review',
    severity: 'info',
    badgeClass: 'bg-yellow-100 text-yellow-800',
  },
  'ticket.transition': {
    label: 'Đổi trạng thái ticket',
    entity: 'ticket',
    severity: 'info',
    badgeClass: 'bg-sky-100 text-sky-700',
  },
  'inquiry.reply': {
    label: 'Trả lời liên hệ',
    entity: 'inquiry',
    severity: 'info',
    badgeClass: 'bg-sky-100 text-sky-700',
  },
  'user.create': {
    label: 'Tạo user',
    entity: 'user',
    severity: 'success',
    badgeClass: 'bg-emerald-100 text-emerald-700',
  },
  'user.update': {
    label: 'Sửa user',
    entity: 'user',
    severity: 'info',
    badgeClass: 'bg-sky-100 text-sky-700',
  },
  'role.assign': {
    label: 'Gán vai trò',
    entity: 'role',
    severity: 'warning',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  'leave.submit': {
    label: 'Gửi đơn nghỉ phép',
    entity: 'leave_request',
    severity: 'info',
    badgeClass: 'bg-sky-100 text-sky-700',
  },
  'leave.decide': {
    label: 'Duyệt đơn nghỉ phép',
    entity: 'leave_request',
    severity: 'info',
    badgeClass: 'bg-indigo-100 text-indigo-700',
  },
  'incident.create': {
    label: 'Tạo sự cố',
    entity: 'incident',
    severity: 'warning',
    badgeClass: 'bg-orange-100 text-orange-700',
  },
  'incident.transition': {
    label: 'Đổi trạng thái sự cố',
    entity: 'incident',
    severity: 'info',
    badgeClass: 'bg-sky-100 text-sky-700',
  },
  'incident.escalate': {
    label: 'Escalate sự cố',
    entity: 'incident',
    severity: 'danger',
    badgeClass: 'bg-red-100 text-red-700',
  },
  'attendance.edit': {
    label: 'Sửa chấm công',
    entity: 'attendance',
    severity: 'warning',
    badgeClass: 'bg-amber-100 text-amber-800',
  },
  'login.success': {
    label: 'Đăng nhập',
    entity: 'session',
    severity: 'info',
    badgeClass: 'bg-slate-100 text-slate-700',
  },
  'login.failed': {
    label: 'Đăng nhập thất bại',
    entity: 'session',
    severity: 'danger',
    badgeClass: 'bg-red-100 text-red-700',
  },
  'tenant.switch': {
    label: 'Đổi chi nhánh',
    entity: 'tenant',
    severity: 'info',
    badgeClass: 'bg-slate-100 text-slate-700',
  },
};

export const ENTITY_LABEL: Record<AuditEntityType, string> = {
  order: 'Đơn hàng',
  refund: 'Hoàn hàng',
  payment: 'Thanh toán',
  campaign: 'Chiến dịch',
  promotion: 'Khuyến mãi',
  voucher_batch: 'Lô voucher',
  product: 'Sản phẩm',
  category: 'Danh mục',
  brand: 'Thương hiệu',
  inventory_transfer: 'Điều chuyển kho',
  stock_take: 'Phiên kiểm kê',
  review: 'Đánh giá',
  ticket: 'Yêu cầu hỗ trợ',
  inquiry: 'Liên hệ',
  user: 'User',
  role: 'Vai trò',
  leave_request: 'Đơn nghỉ phép',
  incident: 'Sự cố',
  attendance: 'Chấm công',
  tenant: 'Chi nhánh',
  session: 'Phiên đăng nhập',
};

export interface IAuditFilter {
  search: string;
  action: AuditAction | 'all';
  entityType: AuditEntityType | 'all';
  tenantId: string | 'all';
  actorId: string | 'all';
  dateFrom: string | null;
  dateTo: string | null;
}
