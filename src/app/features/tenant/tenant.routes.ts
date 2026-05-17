import { type Routes } from '@angular/router';

export const TENANT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./tenants-list.component').then((m) => m.TenantsListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./tenant-detail.component').then((m) => m.TenantDetailComponent),
  },
  {
    path: ':id/edit',
    loadComponent: () => import('./tenant-form.component').then((m) => m.TenantFormComponent),
  },
];
