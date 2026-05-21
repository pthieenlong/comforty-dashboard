import { type Routes } from '@angular/router';

// TODO(auth): apply `auditGuard` from '@/core/auth/audit.guard' to `canActivate`
// once authentication + AuthStore identity are wired to a real backend session.
// Guard is implemented but disabled now so the page is reachable in dev.

export const AUDIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./audit-list.component').then((m) => m.AuditListComponent),
  },
];
