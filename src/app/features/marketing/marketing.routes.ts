import { type Routes } from '@angular/router';

export const MARKETING_ROUTES: Routes = [
  { path: '', redirectTo: 'promotions', pathMatch: 'full' },
  {
    path: 'promotions',
    loadComponent: () =>
      import('./promotions-placeholder.component').then((m) => m.PromotionsPlaceholderComponent),
  },
];
