import { Injectable, computed, signal } from '@angular/core';
import { simulateDelay } from '@/shared/utils';
import { CAMPAIGNS } from './marketing.mock';
import type { CampaignStatus, ICampaign } from './marketing.types';

@Injectable({ providedIn: 'root' })
export class CampaignStore {
  private readonly _campaigns = signal<ICampaign[]>(CAMPAIGNS);
  private readonly _saving = signal(false);

  readonly campaigns = this._campaigns.asReadonly();
  readonly saving = this._saving.asReadonly();

  readonly countByStatus = computed(() => {
    const map = new Map<CampaignStatus, number>();
    this._campaigns().forEach((c) => map.set(c.status, (map.get(c.status) ?? 0) + 1));
    return map;
  });

  findById(id: string): ICampaign | undefined {
    return this._campaigns().find((c) => c.id === id);
  }

  async setStatus(id: string, status: CampaignStatus): Promise<ICampaign | null> {
    this._saving.set(true);
    try {
      await simulateDelay(null, 150, 350);
      const c = this.findById(id);
      if (!c) return null;
      const next: ICampaign = { ...c, status };
      this._campaigns.update((list) => list.map((x) => (x.id === id ? next : x)));
      return next;
    } finally {
      this._saving.set(false);
    }
  }
}
