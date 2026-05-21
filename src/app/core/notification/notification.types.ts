export type NotificationType = 'order' | 'stock' | 'system' | 'user' | 'marketing' | 'hr' | 'crm';

export interface INotificationTypeMeta {
  label: string;
  badgeClass: string;
  dotClass: string;
}

export const NOTIFICATION_TYPE_META: Record<NotificationType, INotificationTypeMeta> = {
  order: {
    label: 'Đơn hàng',
    badgeClass: 'bg-emerald-100 text-emerald-700',
    dotClass: 'bg-emerald-500',
  },
  stock: {
    label: 'Tồn kho',
    badgeClass: 'bg-amber-100 text-amber-800',
    dotClass: 'bg-amber-500',
  },
  system: {
    label: 'Hệ thống',
    badgeClass: 'bg-slate-100 text-slate-700',
    dotClass: 'bg-slate-500',
  },
  user: {
    label: 'Người dùng',
    badgeClass: 'bg-indigo-100 text-indigo-700',
    dotClass: 'bg-indigo-500',
  },
  marketing: {
    label: 'Marketing',
    badgeClass: 'bg-pink-100 text-pink-700',
    dotClass: 'bg-pink-500',
  },
  hr: {
    label: 'Nhân sự',
    badgeClass: 'bg-sky-100 text-sky-700',
    dotClass: 'bg-sky-500',
  },
  crm: {
    label: 'CRM',
    badgeClass: 'bg-violet-100 text-violet-700',
    dotClass: 'bg-violet-500',
  },
};

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  archived?: boolean;
  to?: string;
}
