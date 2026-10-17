import { Routes } from '@angular/router';

// `title` is the breadcrumb's last crumb; `section` is an optional parent crumb before it.
export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    data: { title: 'Dashboard' },
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'roster',
    data: { title: 'Roster' },
    loadComponent: () => import('./heroes/heroes').then((m) => m.Heroes),
  },
  {
    path: 'detail/:id',
    data: { section: 'Roster', title: 'Hero detail' },
    loadComponent: () => import('./hero-detail/hero-detail').then((m) => m.HeroDetail),
  },
  {
    path: 'missions',
    data: { title: 'Missions' },
    loadComponent: () => import('./missions/missions').then((m) => m.Missions),
  },
  {
    path: 'threats',
    data: { title: 'Threats' },
    loadComponent: () => import('./threats/threats').then((m) => m.Threats),
  },
  {
    path: 'recruit',
    data: { title: 'Recruit' },
    loadComponent: () => import('./recruit/recruit').then((m) => m.Recruit),
  },
  {
    path: 'settings',
    data: { title: 'Settings' },
    loadComponent: () => import('./settings/settings').then((m) => m.Settings),
  },
];
