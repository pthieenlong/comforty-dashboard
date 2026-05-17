import { Injectable, computed, signal } from '@angular/core';
import { simulateDelay } from '@/shared/utils';
import { DEFAULT_TENANT_ID, MOCK_TENANTS } from './tenant.mock';
import type { ITenant } from './tenant.types';

@Injectable({ providedIn: 'root' })
export class TenantStore {
  private readonly _tenants = signal<ITenant[]>(MOCK_TENANTS);
  private readonly _currentId = signal<string>(DEFAULT_TENANT_ID);
  private readonly _switching = signal(false);

  readonly tenants = this._tenants.asReadonly();
  readonly switching = this._switching.asReadonly();
  readonly currentTenant = computed<ITenant>(() => {
    const id = this._currentId();
    return this._tenants().find((t) => t.id === id) ?? this._tenants()[0];
  });

  async switchTenant(id: string): Promise<ITenant> {
    if (id === this._currentId()) {
      return this.currentTenant();
    }
    this._switching.set(true);
    try {
      await simulateDelay(null, 400, 800);
      this._currentId.set(id);
      return this.currentTenant();
    } finally {
      this._switching.set(false);
    }
  }
}
