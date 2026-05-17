import { type Routes } from '@angular/router';

export const AUDIT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./audit-placeholder.component').then((m) => m.AuditPlaceholderComponent),
  },
];
