import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    data: { crumb: 'Dashboard' },
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'roster',
    data: { crumb: 'Roster' },
    loadComponent: () => import('./heroes/heroes').then((m) => m.Heroes),
  },
  {
    path: 'detail/:id',
    data: { crumb: 'Hero detail' },
    loadComponent: () => import('./hero-detail/hero-detail').then((m) => m.HeroDetail),
  },
  {
    path: 'recruit',
    data: { crumb: 'Recruit' },
    loadComponent: () => import('./recruit/recruit').then((m) => m.Recruit),
  },
  {
    path: 'missions',
    data: { crumb: 'Missions' },
    loadComponent: () => import('./missions/missions').then((m) => m.Missions),
  },
  {
    path: 'threats',
    data: { crumb: 'Threats' },
    loadComponent: () => import('./threats/threats').then((m) => m.Threats),
  },
  {
    path: 'settings',
    data: { crumb: 'Settings' },
    loadComponent: () => import('./settings/settings').then((m) => m.Settings),
  },
];
