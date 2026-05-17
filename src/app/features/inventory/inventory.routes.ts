import { type Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  { path: '', redirectTo: 'stock', pathMatch: 'full' },
  {
    path: 'stock',
    loadComponent: () =>
      import('./stock-placeholder.component').then((m) => m.StockPlaceholderComponent),
  },
  {
    path: 'transfers',
    loadComponent: () =>
      import('./transfers-placeholder.component').then((m) => m.TransfersPlaceholderComponent),
  },
];
