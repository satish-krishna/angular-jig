import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideShieldAlert, lucideTriangleAlert, lucideUserCheck } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { StatTile } from '../ui/stat-tile';
import { ThreatsViewModel } from './threats.view-model';

@Component({
  selector: 'app-threats',
  imports: [NgIcon, ...HlmBadgeImports, ...HlmCardImports, StatTile],
  providers: [ThreatsViewModel, provideIcons({ lucideCheck, lucideShieldAlert, lucideTriangleAlert, lucideUserCheck })],
  template: `
    <section class="flex flex-col gap-6">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold">Threats</h1>
        <p class="text-sm text-muted-foreground">
          Response coverage by threat tier. A tier is covered when enough Active heroes hold the clearance to answer it.
        </p>
      </header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <app-stat-tile label="Uncovered tiers" [value]="vm.uncoveredCount()" hint="No responder on duty">
          <ng-icon statIcon name="lucideTriangleAlert" />
        </app-stat-tile>
        <app-stat-tile label="Active responders" [value]="vm.activeCount()" hint="Status Active">
          <ng-icon statIcon name="lucideUserCheck" />
        </app-stat-tile>
      </div>

      <div class="grid grid-cols-1 gap-4 lg:grid-cols-2">
        @for (row of vm.coverage(); track row.tier) {
          <div hlmCard>
            <div hlmCardHeader class="flex flex-row items-center justify-between gap-2">
              <h2 hlmCardTitle class="flex min-w-0 items-center gap-2">
                <ng-icon [name]="row.icon" aria-hidden="true" />
                {{ row.tier }} threats
              </h2>
              <span hlmBadge [variant]="row.variant">{{ row.state }}</span>
            </div>
            <div hlmCardContent class="flex flex-col gap-2">
              @if (row.responders.length === 0) {
                <p class="text-sm text-muted-foreground">No Active hero is cleared for this tier.</p>
              } @else {
                <p class="text-sm break-words">{{ row.responders.join(', ') }}</p>
              }
              <p class="text-xs text-muted-foreground">{{ row.responders.length }} on duty</p>
            </div>
          </div>
        }
      </div>
    </section>
  `,
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
