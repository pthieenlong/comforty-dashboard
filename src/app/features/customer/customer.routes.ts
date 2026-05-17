import { type Routes } from '@angular/router';

export const CUSTOMER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./customers-placeholder.component').then((m) => m.CustomersPlaceholderComponent),
  },
];
