import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
  {
    path: 'dashboard',
    loadComponent: () => import('./dashboard/dashboard').then((m) => m.Dashboard),
  },
  {
    path: 'heroes',
    loadComponent: () => import('./heroes/heroes').then((m) => m.Heroes),
  },
  {
    path: 'detail/:id',
    loadComponent: () => import('./hero-detail/hero-detail').then((m) => m.HeroDetail),
  },
];
