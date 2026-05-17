import { type Routes } from '@angular/router';

export const IAM_ROUTES: Routes = [
  { path: '', redirectTo: 'users', pathMatch: 'full' },
  {
    path: 'users',
    loadComponent: () => import('./users/users-list.component').then((m) => m.UsersListComponent),
  },
  {
    path: 'users/new',
    loadComponent: () => import('./users/user-form.component').then((m) => m.UserFormComponent),
  },
  {
    path: 'users/:id',
    loadComponent: () => import('./users/user-detail.component').then((m) => m.UserDetailComponent),
  },
  {
    path: 'users/:id/edit',
    loadComponent: () => import('./users/user-form.component').then((m) => m.UserFormComponent),
  },
  {
    path: 'roles',
    loadComponent: () => import('./roles/roles-list.component').then((m) => m.RolesListComponent),
  },
  {
    path: 'roles/:id',
    loadComponent: () => import('./roles/role-detail.component').then((m) => m.RoleDetailComponent),
  },
  {
    path: 'permissions',
    loadComponent: () =>
      import('./permissions/permissions-list.component').then((m) => m.PermissionsListComponent),
  },
];
