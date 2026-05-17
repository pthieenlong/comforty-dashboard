import { type Routes } from '@angular/router';

export const ORDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./orders-placeholder.component').then((m) => m.OrdersPlaceholderComponent),
  },
];
