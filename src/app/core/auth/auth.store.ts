import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { simulateDelay } from '@/shared/utils';
import { MOCK_CURRENT_USER } from './auth.mock';
import type { ICurrentUser } from './auth.types';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly router = inject(Router);
  private readonly _currentUser = signal<ICurrentUser | null>(MOCK_CURRENT_USER);

  readonly currentUser = this._currentUser.asReadonly();

  async logout(): Promise<void> {
    await simulateDelay(null, 200, 400);
    this._currentUser.set(null);
    await this.router.navigateByUrl('/auth/login');
  }
}
