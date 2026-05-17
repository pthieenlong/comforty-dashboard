import type { INotification } from './notification.types';

const now = Date.now();
const minutesAgo = (m: number): string => new Date(now - m * 60_000).toISOString();
const hoursAgo = (h: number): string => new Date(now - h * 3_600_000).toISOString();
const daysAgo = (d: number): string => new Date(now - d * 86_400_000).toISOString();

export const MOCK_NOTIFICATIONS: INotification[] = [
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
