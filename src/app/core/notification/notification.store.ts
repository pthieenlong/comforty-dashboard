import { Injectable, computed, signal } from '@angular/core';
import { MOCK_NOTIFICATIONS } from './notification.mock';
import type { INotification } from './notification.types';

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly _items = signal<INotification[]>(MOCK_NOTIFICATIONS);

  readonly items = this._items.asReadonly();
  readonly unreadCount = computed(() => this._items().filter((n) => !n.read).length);

  markAsRead(id: string): void {
    this._items.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  markAllAsRead(): void {
    this._items.update((list) => list.map((n) => ({ ...n, read: true })));
  }
}
