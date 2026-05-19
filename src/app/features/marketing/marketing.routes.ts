import { type Routes } from '@angular/router';

export const MARKETING_ROUTES: Routes = [
  { path: '', redirectTo: 'campaigns', pathMatch: 'full' },
  {
    path: 'campaigns',
    loadComponent: () => import('./campaigns-list.component').then((m) => m.CampaignsListComponent),
  },
  {
    path: 'campaigns/new',
    loadComponent: () => import('./campaign-form.component').then((m) => m.CampaignFormComponent),
  },
  {
    path: 'campaigns/:id',
    loadComponent: () =>
      import('./campaign-detail.component').then((m) => m.CampaignDetailComponent),
  },
  {
    path: 'campaigns/:id/edit',
    loadComponent: () => import('./campaign-form.component').then((m) => m.CampaignFormComponent),
  },
  {
    path: 'promotions',
    loadComponent: () =>
      import('./promotions-placeholder.component').then((m) => m.PromotionsPlaceholderComponent),
  },
];
