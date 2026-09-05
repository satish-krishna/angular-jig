import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'roster',
    loadComponent: () => import('./roster/roster').then((m) => m.Roster),
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('./hero-detail/hero-detail').then((m) => m.HeroDetail),
  },
  {
    path: 'recruit',
    loadComponent: () => import('./recruit/recruit').then((m) => m.Recruit),
  },
  {
    path: 'threats',
    loadComponent: () => import('./threats/threats').then((m) => m.Threats),
  },
  {
    path: 'missions',
    loadComponent: () => import('./missions/missions').then((m) => m.Missions),
  },
  {
    path: 'settings',
    loadComponent: () => import('./settings/settings').then((m) => m.Settings),
  },
  // Redirect legacy 'heroes' path to 'roster'
  {
    path: 'heroes',
    loadComponent: () => import('./roster/roster').then((m) => m.Roster),
  },
];
