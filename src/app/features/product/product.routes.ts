import { type Routes } from '@angular/router';

export const PRODUCT_ROUTES: Routes = [
  { path: '', redirectTo: 'products', pathMatch: 'full' },
  {
    path: 'categories',
    loadComponent: () =>
      import('./categories/categories-page.component').then((m) => m.CategoriesPageComponent),
  },
  {
    path: 'brands',
    loadComponent: () =>
      import('./brands/brands-list.component').then((m) => m.BrandsListComponent),
  },
  {
    path: 'brands/new',
    loadComponent: () => import('./brands/brand-form.component').then((m) => m.BrandFormComponent),
  },
  {
    path: 'brands/:id/edit',
    loadComponent: () => import('./brands/brand-form.component').then((m) => m.BrandFormComponent),
  },
  {
    path: 'products',
    loadComponent: () =>
      import('./products/products-list.component').then((m) => m.ProductsListComponent),
  },
  {
    path: 'products/new',
    loadComponent: () =>
      import('./products/product-form.component').then((m) => m.ProductFormComponent),
  },
  {
    path: 'products/:id',
    loadComponent: () =>
      import('./products/product-detail.component').then((m) => m.ProductDetailComponent),
  },
  {
    path: 'products/:id/edit',
    loadComponent: () =>
      import('./products/product-form.component').then((m) => m.ProductFormComponent),
  },
];
