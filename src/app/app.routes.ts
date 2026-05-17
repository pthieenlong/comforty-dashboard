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
