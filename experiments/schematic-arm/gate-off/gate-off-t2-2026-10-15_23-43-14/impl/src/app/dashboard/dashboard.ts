import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideTriangleAlert,
  lucideUserCheck,
  lucideUserPlus,
  lucideZap,
} from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { RouterLink } from '@angular/router';
import { HeroCard } from '../ui/hero-card';
import { StatTile } from '../ui/stat-tile';
import { DashboardViewModel } from './dashboard.view-model';

/**
 * Operations dashboard: the page header with its primary action, the headline stat tiles,
 * the top heroes this cycle, and the roster section heading. A thin shell over its ViewModel.
 */
@Component({
  selector: 'app-dashboard',
  imports: [NgIcon, RouterLink, HlmBadge, HlmButton, HlmCardImports, HlmTableImports, StatTile, HeroCard],
  providers: [
    DashboardViewModel,
    provideIcons({ lucideActivity, lucideTriangleAlert, lucideUserCheck, lucideUserPlus, lucideZap }),
  ],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-wrap items-end justify-between gap-4">
        <div class="flex min-w-0 flex-col gap-1">
          <h1 class="text-2xl font-bold">Operations Dashboard</h1>
          <p class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            Live status across the roster.
            <hlm-badge variant="outline">Example data</hlm-badge>
          </p>
        </div>
        <a hlmBtn routerLink="/recruit">
          <ng-icon name="lucideUserPlus" />
          Recruit
        </a>
      </header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <app-stat-tile label="Active heroes" [value]="vm.activeCount()" [note]="'of ' + vm.total() + ' on the roster'">
          <ng-icon name="lucideUserCheck" />
        </app-stat-tile>
        <app-stat-tile label="Missions logged" [value]="vm.missionCount()" note="across the roster">
          <ng-icon name="lucideActivity" />
        </app-stat-tile>
        <app-stat-tile label="Avg power index" [value]="vm.averagePower()" note="out of 100">
          <ng-icon name="lucideZap" />
        </app-stat-tile>
        <app-stat-tile label="Off duty" [value]="vm.offDutyCount()" note="injured or missing">
          <ng-icon name="lucideTriangleAlert" />
        </app-stat-tile>
      </div>

      <section class="flex flex-col gap-4" aria-labelledby="top-heroes-heading">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 id="top-heroes-heading" class="text-lg font-semibold">Top heroes this cycle</h2>
          <a hlmBtn variant="outline" routerLink="/roster">View all roster</a>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          @for (hero of vm.topHeroes(); track hero.id) {
            <app-hero-card [hero]="hero" />
          }
        </div>
      </section>

      <section class="flex flex-col gap-4" aria-labelledby="roster-heading">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <h2 id="roster-heading" class="text-lg font-semibold">Roster</h2>
          <hlm-badge variant="secondary">{{ vm.total() }} heroes</hlm-badge>
        </div>
        <div hlmCard>
          <div hlmCardContent>
            <div hlmTableContainer>
              <table hlmTable>
                <caption hlmTableCaption class="sr-only">Heroes on the roster, strongest first</caption>
                <thead hlmTableHeader>
                  <tr hlmTableRow>
                    <th hlmTableHead scope="col">Hero</th>
                    <th hlmTableHead scope="col">Class</th>
                    <th hlmTableHead scope="col">Status</th>
                    <th hlmTableHead scope="col" class="text-end">Power</th>
                  </tr>
                </thead>
                <tbody hlmTableBody>
                  @for (row of vm.rosterRows(); track row.hero.id) {
                    <tr hlmTableRow>
                      <td hlmTableCell>
                        <a
                          [routerLink]="['/detail', row.hero.id]"
                          class="font-semibold text-foreground underline-offset-4 hover:underline"
                        >{{ row.hero.name }}</a>
                        <span class="block text-xs text-muted-foreground">{{ row.hero.id }}</span>
                      </td>
                      <td hlmTableCell>
                        <hlm-badge variant="outline">{{ row.hero.powerClass }}</hlm-badge>
                      </td>
                      <td hlmTableCell>
                        <hlm-badge [variant]="row.statusVariant">{{ row.hero.status }}</hlm-badge>
                      </td>
                      <td hlmTableCell class="text-end tabular-nums">{{ row.hero.powerIndex }}</td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </div>
  `,
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);
}
