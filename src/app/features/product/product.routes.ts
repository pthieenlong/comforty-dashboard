import { type Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories-placeholder.component').then((m) => m.CategoriesPlaceholderComponent),
  },
  {
    path: 'brands',
    loadComponent: () =>
      import('./brands-placeholder.component').then((m) => m.BrandsPlaceholderComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./products-placeholder.component').then((m) => m.ProductsPlaceholderComponent),
  },
];
