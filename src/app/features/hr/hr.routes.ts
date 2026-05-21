import { type Routes } from '@angular/router';

export const HR_ROUTES: Routes = [
  { path: '', redirectTo: 'attendance', pathMatch: 'full' },
  {
    path: 'attendance',
    loadComponent: () => import('./attendance.component').then((m) => m.AttendanceComponent),
  },
  {
    path: 'leave-requests',
    loadComponent: () =>
      import('./leave-requests-list.component').then((m) => m.LeaveRequestsListComponent),
  },
  {
    path: 'leave-requests/new',
    loadComponent: () =>
      import('./leave-request-form.component').then((m) => m.LeaveRequestFormComponent),
  },
  {
    path: 'leave-requests/:id',
    loadComponent: () =>
      import('./leave-request-detail.component').then((m) => m.LeaveRequestDetailComponent),
  },
  {
    path: 'incidents',
    loadComponent: () => import('./incidents-list.component').then((m) => m.IncidentsListComponent),
  },
  {
    path: 'incidents/new',
    loadComponent: () => import('./incident-form.component').then((m) => m.IncidentFormComponent),
  },
  {
    path: 'incidents/:id',
    loadComponent: () =>
      import('./incident-detail.component').then((m) => m.IncidentDetailComponent),
  },
];
