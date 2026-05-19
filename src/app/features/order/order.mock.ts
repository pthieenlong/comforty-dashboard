import { CUSTOMERS } from '@/features/customer/customer.mock';
import { MOCK_TENANTS } from '@/core/tenant/tenant.mock';
import { PRODUCTS } from '@/features/product/product.mock';
import type {
  IOrder,
  IOrderEvent,
  IOrderItem,
  IOrderShipping,
  IPayment,
  IRefund,
  IRefundLine,
  OrderChannel,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  RefundReason,
} from './order.types';

const day = 86400000;
const NOW = new Date('2026-05-17T10:00:00Z').getTime();

const ACTORS = [
  'Trần Minh Khoa',
  'Nguyễn Thị Hằng',
  'Phạm Quốc Cường',
  'Lê Hoàng Nam',
  'Đỗ Thu Trang',
  'Võ Minh Tuấn',
  'Bùi Thanh Hà',
  'Hoàng Đức Anh',
];

const CARRIERS = ['GHN', 'GHTK', 'Viettel Post', 'J&T Express', 'Best Express'];

const STORE_TENANT_IDS = MOCK_TENANTS.filter((t) => t.type === 'store').map((t) => t.id);

function pseudoRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 2147483647;
    return s / 2147483647;
  };
}

function pick<T>(arr: T[], rand: () => number, fallback: T): T {
  if (arr.length === 0) return fallback;
  return arr[Math.floor(rand() * arr.length)] ?? fallback;
}

// Status distribution targets out of 80 orders.
const STATUS_PLAN: OrderStatus[] = [
  ...Array(8).fill('draft'),
  ...Array(8).fill('pending_payment'),
  ...Array(10).fill('confirmed'),
  ...Array(6).fill('preparing'),
  ...Array(8).fill('shipping'),
  ...Array(24).fill('completed'),
  ...Array(4).fill('partial_refunded'),
  ...Array(4).fill('refunded'),
  ...Array(8).fill('cancelled'),
] as OrderStatus[];

// Channel: 60 online, 20 POS — interleave so each tenant has a mix.
function channelFor(idx: number): OrderChannel {
  // Every 4th is POS to get ~25% (20/80).
  return idx % 4 === 3 ? 'pos' : 'online';
}

// Map channel + status to payment behaviour.
function paymentMethodFor(channel: OrderChannel, idx: number, rand: () => number): PaymentMethod {
  if (channel === 'pos') {
    // POS: mostly cash/card.
    const opts: PaymentMethod[] = ['cash', 'cash', 'card', 'bank_transfer'];
    return pick(opts, rand, 'cash');
  }
  // Online: cod, bank_transfer, momo, vnpay, card.
  const opts: PaymentMethod[] = ['cod', 'cod', 'bank_transfer', 'momo', 'vnpay', 'card'];
  return pick(opts, rand, 'cod');
}

function paymentStatusFor(orderStatus: OrderStatus): PaymentStatus {
  switch (orderStatus) {
    case 'draft':
    case 'pending_payment':
      return 'pending';
    case 'cancelled':
      return 'failed';
    case 'refunded':
      return 'refunded';
    case 'partial_refunded':
      return 'partial_refunded';
    default:
      return 'paid';
  }
}

function buildItems(idx: number, rand: () => number): IOrderItem[] {
  const lineCount = 1 + Math.floor(rand() * 3);
  const items: IOrderItem[] = [];
  const usedVariantKeys = new Set<string>();

  for (let i = 0; i < lineCount; i++) {
    const product = PRODUCTS[(idx * 7 + i * 11) % PRODUCTS.length];
    if (!product) continue;
    const variant = product.variants[(idx + i) % product.variants.length];
    if (!variant) continue;
    const key = `${product.id}:${variant.id}`;
    if (usedVariantKeys.has(key)) continue;
    usedVariantKeys.add(key);

    const quantity = 1 + Math.floor(rand() * 3);
    const variantLabel = Object.values(variant.attributes).join(' / ');
    const discount = rand() < 0.15 ? Math.round(variant.price * 0.1) * quantity : 0;

    items.push({
      id: `item-${idx}-${i}`,
      productId: product.id,
      productName: product.name,
      variantId: variant.id,
      variantSku: variant.sku,
      variantLabel,
      unitPrice: variant.price,
      quantity,
      discount,
      refundedQuantity: 0,
    });
  }

  return items;
}

function buildEvents(
  code: string,
  status: OrderStatus,
  channel: OrderChannel,
  placedAt: number,
  staffName: string,
): IOrderEvent[] {
  const events: IOrderEvent[] = [];
  const push = (offsetH: number, s: OrderStatus, note: string) => {
    events.push({
      id: `${code}-evt-${events.length + 1}`,
      occurredAt: new Date(placedAt + offsetH * 3600000).toISOString(),
      status: s,
      actor: staffName,
      note,
    });
  };

  push(0, 'draft', channel === 'pos' ? 'Tạo đơn tại quầy' : 'Tạo đơn online');

  if (status === 'draft') return events;

  if (channel === 'online') {
    push(0.5, 'pending_payment', 'Chờ thanh toán');
  }

  if (status === 'pending_payment') return events;

  push(2, 'confirmed', 'Xác nhận đơn');
  if (status === 'confirmed') return events;

  push(8, 'preparing', 'Bắt đầu chuẩn bị hàng');
  if (status === 'preparing') return events;

  push(24, 'shipping', 'Đã giao cho đơn vị vận chuyển');
  if (status === 'shipping') return events;

  if (status === 'cancelled') {
    push(4, 'cancelled', 'Khách yêu cầu huỷ');
    return events;
  }

  push(72, 'completed', 'Khách đã nhận hàng');
  if (status === 'completed') return events;

  if (status === 'partial_refunded') {
    push(96, 'partial_refunded', 'Hoàn một phần do sai size');
    return events;
  }

  if (status === 'refunded') {
    push(96, 'refunded', 'Hoàn toàn bộ đơn hàng');
    return events;
  }

  return events;
}

const REFUND_REASONS: RefundReason[] = [
  'defective',
  'wrong_size',
  'wrong_item',
  'changed_mind',
  'late_delivery',
];

interface OrderBuildResult {
  order: IOrder;
  payment: IPayment;
  refund: IRefund | null;
}

function buildOrder(idx: number): OrderBuildResult {
  const rand = pseudoRandom(idx * 8191 + 17);
  const status = STATUS_PLAN[idx % STATUS_PLAN.length] ?? 'completed';
  const channel = channelFor(idx);
  const tenantId =
    channel === 'pos' ? pick(STORE_TENANT_IDS, rand, 't-q1') : pick(STORE_TENANT_IDS, rand, 't-q1');

  // Customer: most orders have customer; some POS walk-in.
  const isWalkIn = channel === 'pos' && rand() < 0.3;
  const customer = isWalkIn ? null : (CUSTOMERS[idx % CUSTOMERS.length] ?? null);

  const placedAt = NOW - (80 - idx) * day - Math.floor(rand() * day);
  const items = buildItems(idx, rand);
  const subtotal = items.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const itemDiscount = items.reduce((sum, l) => sum + l.discount, 0);
  const orderDiscount = rand() < 0.2 ? Math.round(subtotal * 0.05) : 0;
  const discount = itemDiscount + orderDiscount;

  let shipping: IOrderShipping | null = null;
  if (channel === 'online') {
    const addr = customer?.addresses[0] ?? null;
    const shouldHaveTracking =
      status === 'shipping' ||
      status === 'completed' ||
      status === 'partial_refunded' ||
      status === 'refunded';
    shipping = {
      recipientName: customer?.fullName ?? 'Khách lẻ',
      phone: customer?.phone ?? '0900000000',
      address: addr?.street ?? '',
      ward: addr?.ward ?? '',
      district: addr?.district ?? '',
      city: addr?.city ?? '',
      fee: 30000,
      carrier: pick(CARRIERS, rand, 'GHN'),
      trackingNumber: shouldHaveTracking
        ? `TN${String(idx).padStart(3, '0')}${Math.floor(rand() * 9000 + 1000)}`
        : null,
    };
  }

  const shippingFee = shipping?.fee ?? 0;
  const total = subtotal - discount + shippingFee;
  const paidAmount = status === 'draft' || status === 'pending_payment' ? 0 : total;
  const staffName = pick(ACTORS, rand, ACTORS[0] ?? 'Trần Minh Khoa');

  const events = buildEvents(
    `ORD${String(idx + 1).padStart(4, '0')}`,
    status,
    channel,
    placedAt,
    staffName,
  );

  let confirmedAt: string | null = null;
  let completedAt: string | null = null;
  let cancelledAt: string | null = null;
  events.forEach((e) => {
    if (e.status === 'confirmed' && !confirmedAt) confirmedAt = e.occurredAt;
    if (e.status === 'completed' && !completedAt) completedAt = e.occurredAt;
    if (e.status === 'cancelled' && !cancelledAt) cancelledAt = e.occurredAt;
  });

  // Refund handling for refunded / partial_refunded.
  let refund: IRefund | null = null;
  let refundedAmount = 0;
  const refundIds: string[] = [];

  if (status === 'refunded' || status === 'partial_refunded') {
    const refundReason = pick(REFUND_REASONS, rand, 'wrong_size');
    const refundLines: IRefundLine[] = [];

    if (status === 'refunded') {
      // Refund all lines fully.
      items.forEach((it) => {
        const amount = it.unitPrice * it.quantity - it.discount;
        refundLines.push({
          orderItemId: it.id,
          quantity: it.quantity,
          amount,
          reason: refundReason,
          note: '',
        });
        it.refundedQuantity = it.quantity;
        refundedAmount += amount;
      });
    } else {
      // Partial: refund first line only, half quantity (min 1).
      const first = items[0];
      if (first) {
        const refundQty = Math.max(1, Math.floor(first.quantity / 2));
        const amount = first.unitPrice * refundQty;
        refundLines.push({
          orderItemId: first.id,
          quantity: refundQty,
          amount,
          reason: refundReason,
          note: '',
        });
        first.refundedQuantity = refundQty;
        refundedAmount += amount;
      }
    }

    const refundId = `rf-${String(idx + 1).padStart(4, '0')}`;
    const refundCode = `RF${String(idx + 1).padStart(4, '0')}`;
    const lastEvent = events[events.length - 1];
    refund = {
      id: refundId,
      code: refundCode,
      orderId: `ord-${String(idx + 1).padStart(4, '0')}`,
      orderCode: `ORD${String(idx + 1).padStart(4, '0')}`,
      processedAt: lastEvent?.occurredAt ?? new Date(placedAt + 96 * 3600000).toISOString(),
      processedBy: staffName,
      amount: refundedAmount,
      method: paymentMethodFor(channel, idx, rand),
      status: 'completed',
      reason: refundReason,
      note: status === 'refunded' ? 'Hoàn toàn bộ đơn' : 'Hoàn một phần',
      lines: refundLines,
    };
    refundIds.push(refundId);
  }

  const orderId = `ord-${String(idx + 1).padStart(4, '0')}`;
  const orderCode = `ORD${String(idx + 1).padStart(4, '0')}`;

  const order: IOrder = {
    id: orderId,
    code: orderCode,
    channel,
    status,
    tenantId,
    customerId: customer?.id ?? null,
    customerName: customer?.fullName ?? 'Khách lẻ',
    customerPhone: customer?.phone ?? '',
    placedAt: new Date(placedAt).toISOString(),
    confirmedAt,
    completedAt,
    cancelledAt,
    staffName,
    items,
    shipping,
    subtotal,
    discount,
    shippingFee,
    tax: 0,
    total,
    paidAmount,
    refundedAmount,
    note: '',
    events,
    refundIds,
  };

  // Payment record (1-1 with order for now; COD can be pending).
  const method = paymentMethodFor(channel, idx, rand);
  const payStatus = paymentStatusFor(status);
  const payment: IPayment = {
    id: `pay-${String(idx + 1).padStart(4, '0')}`,
    code: `PAY${String(idx + 1).padStart(4, '0')}`,
    orderId,
    orderCode,
    tenantId,
    method,
    status: payStatus,
    amount: total,
    paidAt:
      payStatus === 'paid' || payStatus === 'refunded' || payStatus === 'partial_refunded'
        ? (confirmedAt ?? new Date(placedAt + 3600000).toISOString())
        : null,
    transactionRef:
      method === 'cash'
        ? null
        : `TXN${String(idx + 1).padStart(6, '0')}${Math.floor(rand() * 1000)}`,
    note: '',
  };

  return { order, payment, refund };
}

const built = Array.from({ length: 80 }, (_, i) => buildOrder(i));

export const ORDERS: IOrder[] = built.map((b) => b.order);
export const PAYMENTS: IPayment[] = built.map((b) => b.payment);
export const REFUNDS: IRefund[] = built
  .map((b) => b.refund)
  .filter((r): r is IRefund => r !== null);

export function findOrder(id: string): IOrder | undefined {
  return ORDERS.find((o) => o.id === id);
}

export function findPayment(id: string): IPayment | undefined {
  return PAYMENTS.find((p) => p.id === id);
}

export function findRefund(id: string): IRefund | undefined {
  return REFUNDS.find((r) => r.id === id);
}

export function findOrdersByCustomer(customerId: string): IOrder[] {
  return ORDERS.filter((o) => o.customerId === customerId);
}
