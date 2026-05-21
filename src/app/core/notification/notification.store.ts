import { Injectable, computed, signal } from '@angular/core';
import { MOCK_NOTIFICATIONS } from './notification.mock';
import type { INotification, NotificationType } from './notification.types';

@Injectable({ providedIn: 'root' })
export class NotificationStore {
  private readonly _items = signal<INotification[]>(MOCK_NOTIFICATIONS);

  readonly items = this._items.asReadonly();
  readonly unreadCount = computed(() => this._items().filter((n) => !n.read && !n.archived).length);
  readonly total = computed(() => this._items().filter((n) => !n.archived).length);

  readonly countByType = computed<Map<NotificationType, number>>(() => {
    const map = new Map<NotificationType, number>();
    for (const n of this._items()) {
      if (n.archived) continue;
      map.set(n.type, (map.get(n.type) ?? 0) + 1);
    }
    return map;
  });

  readonly todayCount = computed(() => {
    const todayPrefix = new Date().toISOString().slice(0, 10);
    return this._items().filter((n) => !n.archived && n.createdAt.startsWith(todayPrefix)).length;
  });

  markAsRead(id: string): void {
    this._items.update((list) => list.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }

  markAllAsRead(): void {
    this._items.update((list) => list.map((n) => ({ ...n, read: true })));
  }

  markManyAsRead(ids: ReadonlySet<string>): void {
    this._items.update((list) => list.map((n) => (ids.has(n.id) ? { ...n, read: true } : n)));
  }

  archiveMany(ids: ReadonlySet<string>): void {
    this._items.update((list) => list.map((n) => (ids.has(n.id) ? { ...n, archived: true } : n)));
  }
}
