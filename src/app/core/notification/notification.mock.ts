import { ORDERS } from '@/features/order/order.mock';
import { CAMPAIGNS, VOUCHER_BATCHES } from '@/features/marketing/marketing.mock';
import { INCIDENTS } from '@/features/hr/incident.mock';
import { LEAVE_REQUESTS } from '@/features/hr/leave-request.mock';
import { TICKETS } from '@/features/customer/ticket.mock';
import { REVIEWS } from '@/features/customer/review.mock';
import type { INotification, NotificationType } from './notification.types';

const now = Date.now();
const minutesAgo = (m: number): string => new Date(now - m * 60_000).toISOString();
const hoursAgo = (h: number): string => new Date(now - h * 3_600_000).toISOString();
const daysAgo = (d: number): string => new Date(now - d * 86_400_000).toISOString();

const SEEDED: INotification[] = [
  {
    id: 'n-001',
    type: 'order',
    title: 'Đơn hàng mới #ORD-10293',
    description: 'Khách hàng Trần Minh Anh vừa đặt 3 sản phẩm — 2.450.000đ',
    createdAt: minutesAgo(3),
    read: false,
    to: '/orders',
  },
  {
    id: 'n-002',
    type: 'stock',
    title: 'Cảnh báo tồn kho thấp',
    description: 'Sofa Comforty Cloud — Quận 1 còn 2 sản phẩm',
    createdAt: minutesAgo(28),
    read: false,
    to: '/inventory/stock',
  },
  {
    id: 'n-003',
    type: 'order',
    title: 'Đơn hàng cần xác nhận',
    description: '5 đơn POS từ Quận 7 đang chờ duyệt',
    createdAt: hoursAgo(1),
    read: false,
    to: '/orders',
  },
  {
    id: 'n-004',
    type: 'user',
    title: 'Người dùng mới',
    description: 'Nguyễn Thu Hà vừa được thêm vào Chi nhánh Hoàn Kiếm',
    createdAt: hoursAgo(3),
    read: true,
    to: '/iam/users',
  },
  {
    id: 'n-005',
    type: 'system',
    title: 'Báo cáo tuần đã sẵn sàng',
    description: 'Doanh thu tuần 19 đã được tổng hợp',
    createdAt: hoursAgo(6),
    read: true,
    to: '/reports',
  },
  {
    id: 'n-006',
    type: 'stock',
    title: 'Phiếu điều chuyển hoàn tất',
    description: 'TR-2025-0042 từ HQ → Quận 7 đã xác nhận',
    createdAt: daysAgo(1),
    read: true,
    to: '/inventory/transfers',
  },
  {
    id: 'n-007',
    type: 'system',
    title: 'Cập nhật hệ thống',
    description: 'Phiên bản v0.4.2 vừa được phát hành',
    createdAt: daysAgo(2),
    read: true,
  },
  {
    id: 'n-008',
    type: 'order',
    title: 'Hoàn tiền đơn #ORD-10211',
    description: 'Yêu cầu refund 1.290.000đ đã được duyệt',
    createdAt: daysAgo(3),
    read: true,
    to: '/orders',
  },
];

// Generated notifications derived from existing domain mocks. Spread timestamps
// across the past 14 days; ~30% remain unread; older items are read.
function generated(): INotification[] {
  const out: INotification[] = [];

  // Latest 10 orders → notification on placed.
  ORDERS.slice(0, 10).forEach((o, idx) => {
    out.push({
      id: `n-gen-order-${o.id}`,
      type: 'order',
      title: `Đơn hàng mới ${o.code}`,
      description: `${o.customerName} · ${o.items.length} sản phẩm · ${o.total.toLocaleString('vi-VN')}đ`,
      createdAt: hoursAgo(idx * 6 + 4),
      read: idx >= 3,
      to: `/orders/${o.id}`,
    });
  });

  // 8 most recent CRM tickets → notification.
  TICKETS.slice(0, 8).forEach((t, idx) => {
    out.push({
      id: `n-gen-ticket-${t.id}`,
      type: 'crm',
      title: `Yêu cầu hỗ trợ ${t.code}`,
      description: t.subject,
      createdAt: hoursAgo(idx * 5 + 8),
      read: idx >= 2,
      to: `/crm/tickets/${t.id}`,
    });
  });

  // 6 reviews moderation events.
  REVIEWS.filter((r) => r.status === 'pending')
    .slice(0, 6)
    .forEach((r, idx) => {
      out.push({
        id: `n-gen-review-${r.id}`,
        type: 'crm',
        title: 'Đánh giá chờ duyệt',
        description: `${r.customerName} · ${r.rating}★ — ${r.title}`,
        createdAt: hoursAgo(idx * 4 + 12),
        read: false,
        to: `/crm/reviews/${r.id}`,
      });
    });

  // 8 leave requests pending.
  LEAVE_REQUESTS.filter((l) => l.status === 'pending')
    .slice(0, 8)
    .forEach((l, idx) => {
      out.push({
        id: `n-gen-leave-${l.id}`,
        type: 'hr',
        title: 'Đơn nghỉ phép chờ duyệt',
        description: `${l.code} · ${l.fromDate} → ${l.toDate}`,
        createdAt: hoursAgo(idx * 7 + 10),
        read: idx >= 4,
        to: `/hr/leave-requests/${l.id}`,
      });
    });

  // 6 critical/high incidents.
  INCIDENTS.filter((i) => i.severity === 'critical' || i.severity === 'high')
    .slice(0, 6)
    .forEach((i, idx) => {
      out.push({
        id: `n-gen-incident-${i.id}`,
        type: 'hr',
        title: `Sự cố ${i.code}`,
        description: i.title,
        createdAt: hoursAgo(idx * 9 + 6),
        read: false,
        to: `/hr/incidents/${i.id}`,
      });
    });

  // 5 marketing campaigns/vouchers.
  CAMPAIGNS.slice(0, 3).forEach((c, idx) => {
    out.push({
      id: `n-gen-campaign-${c.id}`,
      type: 'marketing',
      title: `Chiến dịch ${c.name}`,
      description: `Bắt đầu ${c.startAt.slice(0, 10)} · ${c.channels.join(', ')}`,
      createdAt: daysAgo(idx * 2 + 1),
      read: idx >= 1,
      to: `/marketing/campaigns/${c.id}`,
    });
  });
  VOUCHER_BATCHES.slice(0, 2).forEach((v, idx) => {
    out.push({
      id: `n-gen-voucher-${v.id}`,
      type: 'marketing',
      title: `Lô voucher ${v.name}`,
      description: `${v.totalCodes} mã đã được tạo`,
      createdAt: daysAgo(idx * 3 + 2),
      read: true,
      to: `/marketing/vouchers/${v.id}`,
    });
  });

  // 6 system notifications.
  const systemSeeds: { title: string; desc: string }[] = [
    { title: 'Sao lưu hằng ngày hoàn tất', desc: 'Snapshot 02:00 thành công, dung lượng 2.4GB' },
    {
      title: 'Phiên bản v0.5.0 phát hành',
      desc: 'Thêm Audit log + Notification center · Sprint 11',
    },
    { title: 'Cảnh báo CPU server', desc: 'CPU > 85% trong 10 phút trên web-prod-2' },
    { title: 'SSL certificate sắp hết hạn', desc: '*.comforty.vn còn 14 ngày' },
    { title: 'Đồng bộ dữ liệu kho hoàn tất', desc: 'Sync với hệ thống logistics OK' },
    { title: 'Backup off-site OK', desc: 'AWS S3 ap-southeast-1, 7 ngày retention' },
  ];
  systemSeeds.forEach((s, idx) => {
    out.push({
      id: `n-gen-sys-${idx}`,
      type: 'system',
      title: s.title,
      description: s.desc,
      createdAt: daysAgo(idx + 1),
      read: idx >= 2,
    });
  });

  // 4 user/IAM events.
  const iamSeeds: { title: string; desc: string }[] = [
    { title: 'Vai trò mới được gán', desc: 'Nguyễn Văn B → Customer Service Manager (Quận 7)' },
    {
      title: 'Đổi mật khẩu thành công',
      desc: 'Trần Thị Lan vừa cập nhật mật khẩu',
    },
    { title: 'User đã bị khoá', desc: 'Phạm Quốc — vi phạm chính sách bảo mật' },
    {
      title: '2FA bật cho 5 user mới',
      desc: 'Bộ phận Marketing đã hoàn tất bật xác thực hai bước',
    },
  ];
  iamSeeds.forEach((s, idx) => {
    out.push({
      id: `n-gen-user-${idx}`,
      type: 'user',
      title: s.title,
      description: s.desc,
      createdAt: daysAgo(idx + 2),
      read: idx >= 2,
      to: '/iam/users',
    });
  });

  // 6 stock alerts.
  const stockSeeds: { title: string; desc: string }[] = [
    { title: 'Tồn kho thấp', desc: 'Áo polo cotton size L — Quận 1 còn 3' },
    { title: 'Hết hàng', desc: 'Quần jean slim 32 — kho HQ' },
    { title: 'Điều chuyển chờ xác nhận', desc: 'TR-2026-0089 từ HQ → Thủ Đức' },
    { title: 'Kiểm kê phát hiện chênh lệch', desc: 'ST-2026-0012 lệch 7 sản phẩm' },
    { title: 'Nhập hàng đến', desc: '120 thùng đã về kho HQ' },
    { title: 'Reorder trigger', desc: '5 SKU vượt ngưỡng đặt hàng tự động' },
  ];
  stockSeeds.forEach((s, idx) => {
    out.push({
      id: `n-gen-stock-${idx}`,
      type: 'stock',
      title: s.title,
      description: s.desc,
      createdAt: daysAgo(idx * 0.5 + 0.5),
      read: idx >= 3,
      to: '/inventory/stock',
    });
  });

  return out;
}

export const MOCK_NOTIFICATIONS: INotification[] = [...SEEDED, ...generated()].sort((a, b) =>
  b.createdAt.localeCompare(a.createdAt),
);

// Keep `NotificationType` import alive for tree-shaking inspection.
export type { NotificationType };
