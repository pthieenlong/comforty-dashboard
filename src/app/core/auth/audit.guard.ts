import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { canViewWholeCompany } from '@/core/department/department.config';
import { ROLES } from '@/features/iam/iam.mock';
import { AuthStore } from './auth.store';

/**
 * Audit log access guard.
 *
 * Allows Super Admin, HQ Admin (via `canViewWholeCompany`) and Auditor role.
 * All other roles are redirected to `/forbidden`.
 *
 * Resolves the IAM role ID from `AuthStore.currentUser().roleLabel` since the
 * mock auth payload only carries the human-readable label.
 */
export const auditGuard: CanActivateFn = () => {
  const authStore = inject(AuthStore);
  const router = inject(Router);
  const label = authStore.currentUser()?.roleLabel ?? '';
  const roleId = ROLES.find((r) => r.name === label)?.id ?? 'role-staff';
  if (canViewWholeCompany(roleId) || roleId === 'role-auditor') {
    return true;
  }
  return router.parseUrl('/forbidden');
};
