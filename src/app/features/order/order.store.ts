import { Injectable, computed, signal } from '@angular/core';
import { simulateDelay } from '@/shared/utils';
import { ORDERS, REFUNDS } from './order.mock';
import type { IOrder, IOrderEvent, IRefund, OrderStatus } from './order.types';

@Injectable({ providedIn: 'root' })
export class OrderStore {
  private readonly _orders = signal<IOrder[]>(ORDERS);
  private readonly _refunds = signal<IRefund[]>(REFUNDS);
  private readonly _saving = signal(false);

  readonly orders = this._orders.asReadonly();
  readonly refunds = this._refunds.asReadonly();
  readonly saving = this._saving.asReadonly();

  readonly countByStatus = computed(() => {
    const map = new Map<OrderStatus, number>();
    this._orders().forEach((o) => map.set(o.status, (map.get(o.status) ?? 0) + 1));
    return map;
  });

  findById(id: string): IOrder | undefined {
    return this._orders().find((o) => o.id === id);
  }

  findByCustomer(customerId: string): IOrder[] {
    return this._orders().filter((o) => o.customerId === customerId);
  }

  findByTenant(tenantId: string): IOrder[] {
    return this._orders().filter((o) => o.tenantId === tenantId);
  }

  findRefundsByOrder(orderId: string): IRefund[] {
    return this._refunds().filter((r) => r.orderId === orderId);
  }

  async transition(
    id: string,
    next: OrderStatus,
    actor: string,
    note = '',
  ): Promise<IOrder | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 400);
      const order = this.findById(id);
      if (!order) return null;
      const event: IOrderEvent = {
        id: `${order.code}-evt-${order.events.length + 1}`,
        occurredAt: new Date().toISOString(),
        status: next,
        actor,
        note,
      };
      const updated: IOrder = {
        ...order,
        status: next,
        events: [...order.events, event],
        confirmedAt: next === 'confirmed' ? event.occurredAt : order.confirmedAt,
        completedAt: next === 'completed' ? event.occurredAt : order.completedAt,
        cancelledAt: next === 'cancelled' ? event.occurredAt : order.cancelledAt,
      };
      this._orders.update((list) => list.map((o) => (o.id === id ? updated : o)));
      return updated;
    } finally {
      this._saving.set(false);
    }
  }

  async addRefund(refund: IRefund): Promise<void> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 400);
      this._refunds.update((list) => [...list, refund]);
      this._orders.update((list) =>
        list.map((o) => {
          if (o.id !== refund.orderId) return o;
          const refundedAmount = o.refundedAmount + refund.amount;
          const fullyRefunded = refundedAmount >= o.total;
          return {
            ...o,
            refundedAmount,
            refundIds: [...o.refundIds, refund.id],
            status: fullyRefunded ? 'refunded' : 'partial_refunded',
            items: o.items.map((it) => {
              const line = refund.lines.find((l) => l.orderItemId === it.id);
              if (!line) return it;
              return { ...it, refundedQuantity: it.refundedQuantity + line.quantity };
            }),
          };
        }),
      );
    } finally {
      this._saving.set(false);
    }
  }
}
