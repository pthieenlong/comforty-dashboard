import { type Routes } from '@angular/router';

export const INVENTORY_ROUTES: Routes = [
  { path: '', redirectTo: 'stock', pathMatch: 'full' },
  {
    path: 'stock',
    loadComponent: () => import('./stock-list.component').then((m) => m.StockListComponent),
  },
  {
    path: 'movements',
    loadComponent: () => import('./movements-list.component').then((m) => m.MovementsListComponent),
  },
  {
    path: 'transfers',
    loadComponent: () => import('./transfers-list.component').then((m) => m.TransfersListComponent),
  },
  {
    path: 'transfers/new',
    loadComponent: () => import('./transfer-form.component').then((m) => m.TransferFormComponent),
  },
  {
    path: 'transfers/:id',
    loadComponent: () =>
      import('./transfer-detail.component').then((m) => m.TransferDetailComponent),
  },
  {
    path: 'stock-take',
    loadComponent: () =>
      import('./stock-take-list.component').then((m) => m.StockTakeListComponent),
  },
  {
    path: 'stock-take/:id',
    loadComponent: () =>
      import('./stock-take-counter.component').then((m) => m.StockTakeCounterComponent),
  },
];
