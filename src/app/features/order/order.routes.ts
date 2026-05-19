import { type Routes } from '@angular/router';

export const ORDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./orders-list.component').then((m) => m.OrdersListComponent),
  },
  {
    path: 'new',
    loadComponent: () => import('./order-pos-form.component').then((m) => m.OrderPosFormComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./order-detail.component').then((m) => m.OrderDetailComponent),
  },
];
