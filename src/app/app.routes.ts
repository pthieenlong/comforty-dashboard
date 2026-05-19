import { type Routes } from '@angular/router';
import { AdminLayoutComponent } from '@/layouts/admin-layout/admin-layout.component';
import { AuthLayoutComponent } from '@/layouts/auth-layout/auth-layout.component';

export const routes: Routes = [
  {
    path: 'auth',
    component: AuthLayoutComponent,
    children: [
      { path: '', redirectTo: 'login', pathMatch: 'full' },
      {
        path: 'login',
        loadComponent: () =>
          import('@/features/auth/login/login.component').then((m) => m.LoginComponent),
      },
      {
        path: 'forgot-password',
        loadComponent: () =>
          import('@/features/auth/forgot-password/forgot-password.component').then(
            (m) => m.ForgotPasswordComponent,
          ),
      },
      {
        path: 'reset-password',
        loadComponent: () =>
          import('@/features/auth/reset-password/reset-password.component').then(
            (m) => m.ResetPasswordComponent,
          ),
      },
    ],
  },
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('@/features/dashboard/dashboard-placeholder.component').then(
            (m) => m.DashboardPlaceholderComponent,
          ),
      },
      {
        path: 'iam',
        loadChildren: () => import('@/features/iam/iam.routes').then((m) => m.IAM_ROUTES),
      },
      {
        path: 'orders',
        loadChildren: () => import('@/features/order/order.routes').then((m) => m.ORDER_ROUTES),
      },
      {
        path: 'payments',
        loadChildren: () => import('@/features/order/payment.routes').then((m) => m.PAYMENT_ROUTES),
      },
      {
        path: 'customers',
        loadChildren: () =>
          import('@/features/customer/customer.routes').then((m) => m.CUSTOMER_ROUTES),
      },
      {
        path: 'catalog',
        loadChildren: () =>
          import('@/features/product/product.routes').then((m) => m.PRODUCT_ROUTES),
      },
      {
        path: 'inventory',
        loadChildren: () =>
          import('@/features/inventory/inventory.routes').then((m) => m.INVENTORY_ROUTES),
      },
      {
        path: 'marketing',
        loadChildren: () =>
          import('@/features/marketing/marketing.routes').then((m) => m.MARKETING_ROUTES),
      },
      {
        path: 'hr',
        loadChildren: () => import('@/features/hr/hr.routes').then((m) => m.HR_ROUTES),
      },
      {
        path: 'audit',
        loadChildren: () => import('@/features/audit/audit.routes').then((m) => m.AUDIT_ROUTES),
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('@/features/dashboard/reports-placeholder.component').then(
            (m) => m.ReportsPlaceholderComponent,
          ),
      },
      {
        path: 'tenants',
        loadChildren: () => import('@/features/tenant/tenant.routes').then((m) => m.TENANT_ROUTES),
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('@/features/error/forbidden.component').then((m) => m.ForbiddenComponent),
      },
    ],
  },
  {
    path: '**',
    loadComponent: () =>
      import('@/features/error/not-found.component').then((m) => m.NotFoundComponent),
  },
];
