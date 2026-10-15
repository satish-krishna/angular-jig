import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus, lucideUsers } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HeroCard } from '../ui/hero-card';
import { StatTile } from '../ui/stat-tile';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, NgIcon, HlmBadgeImports, HlmButtonImports, HlmTableImports, HeroCard, StatTile],
  providers: [DashboardViewModel, provideIcons({ lucideUserPlus, lucideUsers })],
  template: `
    <div class="flex flex-col gap-8">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex min-w-0 flex-col gap-1">
          <h1 class="text-2xl font-semibold">Operations Dashboard</h1>
          <p class="text-sm text-muted-foreground">
            Example data. Roster, mission and threat figures are illustrative.
          </p>
        </div>
        <a hlmBtn [routerLink]="['/recruit']">
          <ng-icon name="lucideUserPlus" aria-hidden="true" />
          Recruit
        </a>
      </header>

      <section aria-label="Operations summary" class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        @for (stat of vm.stats(); track stat.label) {
          <app-stat-tile
            [label]="stat.label"
            [value]="stat.value"
            [hint]="stat.hint"
            [icon]="stat.icon"
          />
        }
      </section>

      <section aria-labelledby="top-heroes-heading" class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <h2 id="top-heroes-heading" class="text-lg font-semibold">Top heroes this cycle</h2>
          <a hlmBtn variant="outline" [routerLink]="['/roster']">
            <ng-icon name="lucideUsers" aria-hidden="true" />
            View all roster
          </a>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (hero of vm.topHeroes(); track hero.id) {
            <app-hero-card [hero]="hero" (opened)="vm.openHero($event)" />
          }
        </div>
      </section>

      <section aria-labelledby="roster-heading" class="flex flex-col gap-4">
        <div class="flex flex-wrap items-center gap-3">
          <h2 id="roster-heading" class="text-lg font-semibold">Roster</h2>
          <span hlmBadge variant="secondary">{{ vm.heroCount() }} heroes</span>
        </div>
        <div hlmTableContainer>
          <table hlmTable>
            <caption hlmTableCaption>Full roster, strongest first. Example data.</caption>
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead scope="col">Hero</th>
                <th hlmTableHead scope="col">Class</th>
                <th hlmTableHead scope="col" class="text-right">Power</th>
                <th hlmTableHead scope="col">Status</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              @for (hero of vm.roster(); track hero.id) {
                <tr hlmTableRow>
                  <td hlmTableCell>
                    <a class="font-medium hover:underline" [routerLink]="['/detail', hero.id]">{{ hero.name }}</a>
                  </td>
                  <td hlmTableCell>
                    <span hlmBadge variant="outline">{{ hero.powerClass }}</span>
                  </td>
                  <td hlmTableCell class="text-right tabular-nums">{{ hero.powerIndex }}</td>
                  <td hlmTableCell>
                    <span hlmBadge [variant]="hero.statusVariant">{{ hero.status }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </section>
    </div>
  `,
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
}
