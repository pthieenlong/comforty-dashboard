import { Injectable, computed, signal } from '@angular/core';
import { simulateDelay } from '@/shared/utils';
import { PROMOTIONS } from './marketing.mock';
import type { IPromotion, PromotionStatus } from './marketing.types';

@Injectable({ providedIn: 'root' })
export class PromotionStore {
  private readonly _promotions = signal<IPromotion[]>(PROMOTIONS);
  private readonly _saving = signal(false);

  readonly promotions = this._promotions.asReadonly();
  readonly saving = this._saving.asReadonly();

  readonly countByStatus = computed(() => {
    const map = new Map<PromotionStatus, number>();
    this._promotions().forEach((p) => map.set(p.status, (map.get(p.status) ?? 0) + 1));
    return map;
  });

  findById(id: string): IPromotion | undefined {
    return this._promotions().find((p) => p.id === id);
  }

  findByCampaign(campaignId: string): IPromotion[] {
    return this._promotions().filter((p) => p.campaignId === campaignId);
  }

  async setStatus(id: string, status: PromotionStatus): Promise<IPromotion | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 150, 350);
      const p = this.findById(id);
      if (!p) return null;
      const next: IPromotion = { ...p, status };
      this._promotions.update((list) => list.map((x) => (x.id === id ? next : x)));
      return next;
    } finally {
      this._saving.set(false);
    }
  }
}
