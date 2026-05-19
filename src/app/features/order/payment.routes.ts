import { type Routes } from '@angular/router';

export const PAYMENT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () => import('./payments-list.component').then((m) => m.PaymentsListComponent),
  },
  {
    path: ':id',
    loadComponent: () => import('./payment-detail.component').then((m) => m.PaymentDetailComponent),
  },
];
