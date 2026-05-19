export type OrderChannel = 'pos' | 'online';

export type OrderStatus =
  | 'draft'
  | 'pending_payment'
  | 'confirmed'
  | 'preparing'
  | 'shipping'
  | 'completed'
  | 'partial_refunded'
  | 'refunded'
  | 'cancelled';

export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'momo' | 'vnpay' | 'cod';

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'partial_refunded';

export type RefundReason =
  | 'defective'
  | 'wrong_size'
  | 'wrong_item'
  | 'changed_mind'
  | 'late_delivery'
  | 'other';

export interface IOrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId: string;
  variantSku: string;
  variantLabel: string;
  unitPrice: number;
  quantity: number;
  discount: number;
  refundedQuantity: number;
}

export interface IOrderShipping {
  recipientName: string;
  phone: string;
  address: string;
  ward: string;
  district: string;
  city: string;
  fee: number;
  carrier: string | null;
  trackingNumber: string | null;
}

export interface IOrderEvent {
  id: string;
  occurredAt: string;
  status: OrderStatus;
  actor: string;
  note: string;
}

export interface IRefundLine {
  orderItemId: string;
  quantity: number;
  amount: number;
  reason: RefundReason;
  note: string;
}

export interface IRefund {
  id: string;
  code: string;
  orderId: string;
  orderCode: string;
  processedAt: string;
  processedBy: string;
  amount: number;
  method: PaymentMethod;
  status: 'completed' | 'pending';
  reason: RefundReason;
  note: string;
  lines: IRefundLine[];
}

export interface IOrder {
  id: string;
  code: string;
  channel: OrderChannel;
  status: OrderStatus;
  tenantId: string;
  customerId: string | null;
  customerName: string;
  customerPhone: string;
  placedAt: string;
  confirmedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  staffName: string;
  items: IOrderItem[];
  shipping: IOrderShipping | null;
  subtotal: number;
  discount: number;
  shippingFee: number;
  tax: number;
  total: number;
  paidAmount: number;
  refundedAmount: number;
  note: string;
  events: IOrderEvent[];
  refundIds: string[];
}

export interface IPayment {
  id: string;
  code: string;
  orderId: string;
  orderCode: string;
  tenantId: string;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  paidAt: string | null;
  transactionRef: string | null;
  note: string;
}

export interface OrderStatusMeta {
  label: string;
  badgeVariant: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
  description: string;
}

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  draft: {
    label: 'Nháp',
    badgeVariant: 'neutral',
    description: 'Đơn đang được soạn, chưa xác nhận.',
  },
  pending_payment: {
    label: 'Chờ thanh toán',
    badgeVariant: 'warning',
    description: 'Đơn đã tạo, chờ khách thanh toán.',
  },
  confirmed: {
    label: 'Đã xác nhận',
    badgeVariant: 'info',
    description: 'Đơn đã xác nhận, chờ chuẩn bị.',
  },
  preparing: {
    label: 'Đang chuẩn bị',
    badgeVariant: 'info',
    description: 'Đang đóng gói/chuẩn bị hàng.',
  },
  shipping: {
    label: 'Đang giao',
    badgeVariant: 'info',
    description: 'Đơn đang được vận chuyển.',
  },
  completed: {
    label: 'Hoàn tất',
    badgeVariant: 'success',
    description: 'Đơn đã giao thành công.',
  },
  partial_refunded: {
    label: 'Hoàn một phần',
    badgeVariant: 'warning',
    description: 'Đơn đã hoàn một phần.',
  },
  refunded: {
    label: 'Đã hoàn',
    badgeVariant: 'warning',
    description: 'Đơn đã hoàn toàn bộ.',
  },
  cancelled: {
    label: 'Đã huỷ',
    badgeVariant: 'danger',
    description: 'Đơn đã bị huỷ.',
  },
};

export interface PaymentMethodMeta {
  label: string;
  icon?: string;
}

export const PAYMENT_METHOD_META: Record<PaymentMethod, PaymentMethodMeta> = {
  cash: { label: 'Tiền mặt' },
  card: { label: 'Thẻ tín dụng' },
  bank_transfer: { label: 'Chuyển khoản' },
  momo: { label: 'Momo' },
  vnpay: { label: 'VNPay' },
  cod: { label: 'COD' },
};

export interface PaymentStatusMeta {
  label: string;
  badgeVariant: 'neutral' | 'info' | 'warning' | 'success' | 'danger';
}

export const PAYMENT_STATUS_META: Record<PaymentStatus, PaymentStatusMeta> = {
  pending: { label: 'Chờ', badgeVariant: 'warning' },
  paid: { label: 'Đã thanh toán', badgeVariant: 'success' },
  failed: { label: 'Thất bại', badgeVariant: 'danger' },
  refunded: { label: 'Đã hoàn', badgeVariant: 'neutral' },
  partial_refunded: { label: 'Hoàn một phần', badgeVariant: 'warning' },
};

export interface RefundReasonMeta {
  label: string;
}

export const REFUND_REASON_META: Record<RefundReason, RefundReasonMeta> = {
  defective: { label: 'Hàng lỗi' },
  wrong_size: { label: 'Sai size' },
  wrong_item: { label: 'Sai mẫu' },
  changed_mind: { label: 'Đổi ý' },
  late_delivery: { label: 'Giao trễ' },
  other: { label: 'Khác' },
};
