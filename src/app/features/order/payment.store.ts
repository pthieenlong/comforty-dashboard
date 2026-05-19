import { Injectable, computed, signal } from '@angular/core';
import { simulateDelay } from '@/shared/utils';
import { PAYMENTS } from './order.mock';
import type { IPayment, PaymentStatus } from './order.types';

@Injectable({ providedIn: 'root' })
export class PaymentStore {
  private readonly _payments = signal<IPayment[]>(PAYMENTS);
  private readonly _saving = signal(false);

  readonly payments = this._payments.asReadonly();
  readonly saving = this._saving.asReadonly();

  readonly countByStatus = computed(() => {
    const map = new Map<PaymentStatus, number>();
    this._payments().forEach((p) => map.set(p.status, (map.get(p.status) ?? 0) + 1));
    return map;
  });

  readonly totalPaid = computed(() =>
    this._payments()
      .filter((p) => p.status === 'paid')
      .reduce((sum, p) => sum + p.amount, 0),
  );

  findById(id: string): IPayment | undefined {
    return this._payments().find((p) => p.id === id);
  }

  findByOrder(orderId: string): IPayment[] {
    return this._payments().filter((p) => p.orderId === orderId);
  }

  findByTenant(tenantId: string): IPayment[] {
    return this._payments().filter((p) => p.tenantId === tenantId);
  }

  async addPayment(payment: IPayment): Promise<IPayment> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 400);
      this._payments.update((list) => [payment, ...list]);
      return payment;
    } finally {
      this._saving.set(false);
    }
  }

  nextPaymentCode(): string {
    const seq = this._payments().length + 1;
    return `PAY${String(seq).padStart(4, '0')}`;
  }
}
