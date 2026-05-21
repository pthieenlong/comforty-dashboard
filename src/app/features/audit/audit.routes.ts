import { type Routes } from '@angular/router';
import { auditGuard } from '@/core/auth/audit.guard';

export const AUDIT_ROUTES: Routes = [
  {
    path: '',
    canActivate: [auditGuard],
    loadComponent: () => import('./audit-list.component').then((m) => m.AuditListComponent),
  },
];
