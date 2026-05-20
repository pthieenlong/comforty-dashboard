import { Injectable, computed, signal } from '@angular/core';
import { simulateDelay } from '@/shared/utils';
import { VOUCHER_BATCHES, VOUCHER_CODES } from './marketing.mock';
import type { IVoucherBatch, IVoucherCode, VoucherStatus } from './marketing.types';

@Injectable({ providedIn: 'root' })
export class VoucherStore {
  private readonly _batches = signal<IVoucherBatch[]>(VOUCHER_BATCHES);
  private readonly _codes = signal<IVoucherCode[]>(VOUCHER_CODES);
  private readonly _saving = signal(false);

  readonly batches = this._batches.asReadonly();
  readonly codes = this._codes.asReadonly();
  readonly saving = this._saving.asReadonly();

  readonly countByStatus = computed(() => {
    const map = new Map<VoucherStatus, number>();
    this._batches().forEach((b) => map.set(b.status, (map.get(b.status) ?? 0) + 1));
    return map;
  });

  readonly totalUsage = computed(() => this._batches().reduce((sum, b) => sum + b.usedCount, 0));

  findBatchById(id: string): IVoucherBatch | undefined {
    return this._batches().find((b) => b.id === id);
  }

  findCodesByBatch(batchId: string): IVoucherCode[] {
    return this._codes().filter((c) => c.batchId === batchId);
  }

  findByCampaign(campaignId: string): IVoucherBatch[] {
    return this._batches().filter((b) => b.campaignId === campaignId);
  }

  async setStatus(id: string, status: VoucherStatus): Promise<IVoucherBatch | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 150, 350);
      const b = this.findBatchById(id);
      if (!b) return null;
      const next: IVoucherBatch = { ...b, status };
      this._batches.update((list) => list.map((x) => (x.id === id ? next : x)));
      return next;
    } finally {
      this._saving.set(false);
    }
  }

  async addBatch(batch: IVoucherBatch, codes: IVoucherCode[]): Promise<IVoucherBatch> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 200, 500);
      this._batches.update((list) => [batch, ...list]);
      this._codes.update((list) => [...codes, ...list]);
      return batch;
    } finally {
      this._saving.set(false);
    }
  }
}
