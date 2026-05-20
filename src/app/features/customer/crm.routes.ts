import { type Routes } from '@angular/router';

export const CRM_ROUTES: Routes = [
  { path: '', redirectTo: 'reviews', pathMatch: 'full' },
  {
    path: 'reviews',
    loadComponent: () => import('./reviews-list.component').then((m) => m.ReviewsListComponent),
  },
  {
    path: 'reviews/:id',
    loadComponent: () => import('./review-detail.component').then((m) => m.ReviewDetailComponent),
  },
  {
    path: 'tickets',
    loadComponent: () => import('./tickets-list.component').then((m) => m.TicketsListComponent),
  },
  {
    path: 'tickets/:id',
    loadComponent: () => import('./ticket-detail.component').then((m) => m.TicketDetailComponent),
  },
];
