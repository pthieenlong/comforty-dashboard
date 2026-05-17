export type NotificationType = 'order' | 'stock' | 'system' | 'user';

export interface INotification {
  id: string;
  type: NotificationType;
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
  to?: string;
}
