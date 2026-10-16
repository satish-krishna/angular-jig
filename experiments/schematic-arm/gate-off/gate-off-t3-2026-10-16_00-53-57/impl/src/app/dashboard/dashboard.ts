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
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { DashboardViewModel } from './dashboard.view-model';
import { HeroCard } from '../ui/hero-card/hero-card';
import { RosterTable } from '../ui/roster-table/roster-table';
import { StatTile } from '../ui/stat-tile/stat-tile';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgIcon, HlmButtonImports, HlmBadgeImports, StatTile, HeroCard, RosterTable],
  providers: [
    DashboardViewModel,
    provideIcons({
      lucideActivity,
      lucideShieldAlert,
      lucideUserCheck,
      lucideUserPlus,
      lucideZap,
    }),
  ],
  template: `
    <div class="flex flex-col gap-8">
      <header class="flex flex-wrap items-center justify-between gap-3">
        <div class="min-w-0">
          <h1 class="text-2xl font-semibold">Operations Dashboard</h1>
          <p class="text-sm text-muted-foreground">Example data, for demonstration only.</p>
        </div>
        <a hlmBtn routerLink="/recruit">
          <ng-icon name="lucideUserPlus" aria-hidden="true" />
          Recruit
        </a>
      </header>

      <section aria-label="Key figures" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <app-stat-tile label="Heroes on roster" icon="lucideUserCheck" [value]="vm.rosterCount()" />
        <app-stat-tile label="Active now" icon="lucideActivity" [value]="vm.activeCount()" />
        <app-stat-tile label="Average power" icon="lucideZap" [value]="vm.averagePower()" />
        <app-stat-tile label="Need attention" icon="lucideShieldAlert" [value]="vm.attentionCount()" />
      </section>

      <section aria-labelledby="top-heroes-heading" class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 id="top-heroes-heading" class="text-lg font-semibold">Top heroes this cycle</h2>
          <a hlmBtn variant="link" routerLink="/roster">View all roster</a>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (hero of vm.topHeroes(); track hero.id) {
            <app-hero-card [hero]="hero" />
          }
        </div>
      </section>

      <section aria-labelledby="roster-heading" class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 id="roster-heading" class="text-lg font-semibold">Roster</h2>
          <span hlmBadge variant="outline">{{ vm.rosterCount() }} heroes</span>
        </div>
        <app-roster-table [heroes]="vm.roster()" />
      </section>
    </div>
  `,
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
}
