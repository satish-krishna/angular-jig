import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCheck, lucideTriangleAlert } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { PowerMeter } from '../ui/power-meter';
import { StatTile } from '../ui/stat-tile';
import { MissionsViewModel } from './missions.view-model';

/**
 * Missions screen: the mission totals and each hero's record, with the success rate on a meter.
 * Read-only; the records come from the roster through the ViewModel. A thin shell over its ViewModel.
 */
@Component({
  selector: 'app-missions',
  imports: [NgIcon, RouterLink, HlmBadge, HlmCardImports, PowerMeter, StatTile],
  providers: [
    MissionsViewModel,
    provideIcons({ lucideActivity, lucideCheck, lucideTriangleAlert }),
  ],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold">Missions</h1>
        <p class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Mission record for each hero, busiest first.
          <hlm-badge variant="outline">Example data</hlm-badge>
        </p>
      </header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <app-stat-tile label="Missions logged" [value]="vm.missionTotal()" note="across the roster">
          <ng-icon name="lucideActivity" />
        </app-stat-tile>
        <app-stat-tile label="Won" [value]="vm.wonTotal()" note="successful missions">
          <ng-icon name="lucideCheck" />
        </app-stat-tile>
        <app-stat-tile label="Lost" [value]="vm.lostTotal()" note="unsuccessful missions">
          <ng-icon name="lucideTriangleAlert" />
        </app-stat-tile>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        @for (row of vm.rows(); track row.hero.id) {
          <div hlmCard class="h-full">
            <div hlmCardHeader class="flex flex-col gap-1">
              <a
                [routerLink]="['/detail', row.hero.id]"
                class="truncate font-semibold text-foreground underline-offset-4 hover:underline"
              >{{ row.hero.name }}</a>
              <p hlmCardDescription>{{ row.hero.id }} · {{ row.hero.alias }}</p>
            </div>
            <div hlmCardContent class="flex flex-col gap-4">
              <div class="flex flex-wrap gap-2">
                <hlm-badge variant="secondary">{{ row.hero.missionCount }} missions</hlm-badge>
                <hlm-badge variant="success">{{ row.won }} won</hlm-badge>
                <hlm-badge variant="destructive">{{ row.lost }} lost</hlm-badge>
              </div>
              <app-power-meter label="Success rate" [value]="row.hero.successRate" />
            </div>
          </div>
        } @empty {
          <p class="text-sm text-muted-foreground">No missions are on record.</p>
        }
      </div>
    </div>
  `,
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
