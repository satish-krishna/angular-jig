import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideShieldAlert,
  lucideUserCheck,
  lucideUserPlus,
  lucideZap,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HeroCard } from '../ui/hero-card';
import { RosterTable } from '../ui/roster-table';
import { StatTile } from '../ui/stat-tile';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgIcon, HlmButtonImports, StatTile, HeroCard, RosterTable],
  providers: [
    DashboardViewModel,
    provideIcons({ lucideActivity, lucideShieldAlert, lucideUserCheck, lucideUserPlus, lucideZap }),
  ],
  template: `
    <section class="flex flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div class="flex min-w-0 flex-col gap-1">
          <h1 class="text-2xl font-semibold">Operations Dashboard</h1>
          <p class="text-sm text-muted-foreground">Example data. Every hero and figure here is invented for the demo.</p>
        </div>
        <a hlmBtn routerLink="/recruit">
          <ng-icon name="lucideUserPlus" />
          Recruit
        </a>
      </header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        @for (stat of vm.stats(); track stat.label) {
          <app-stat-tile [label]="stat.label" [value]="stat.value" [hint]="stat.hint">
            <ng-icon statIcon [name]="stat.icon" />
          </app-stat-tile>
        }
      </div>

      <section aria-labelledby="top-heroes-heading" class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 id="top-heroes-heading" class="text-lg font-semibold">Top heroes this cycle</h2>
          <a hlmBtn variant="outline" size="sm" routerLink="/roster">View all roster</a>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (hero of vm.topHeroes(); track hero.id) {
            <app-hero-card [hero]="hero" />
          }
        </div>
      </section>

      <section aria-labelledby="roster-heading" class="flex flex-col gap-4">
        <div class="flex flex-wrap items-baseline justify-between gap-2">
          <h2 id="roster-heading" class="text-lg font-semibold">Roster</h2>
          <span class="text-sm text-muted-foreground">{{ vm.rosterCount() }} heroes</span>
        </div>
        <app-roster-table [rows]="vm.rosterRows()" />
      </section>
    </section>
  `,
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
}
