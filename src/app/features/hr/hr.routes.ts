import { type Routes } from '@angular/router';

export const HR_ROUTES: Routes = [
  { path: '', redirectTo: 'attendance', pathMatch: 'full' },
  {
    path: 'attendance',
    loadComponent: () =>
      import('./attendance-placeholder.component').then((m) => m.AttendancePlaceholderComponent),
  },
];
