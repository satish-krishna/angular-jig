import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCheck, lucideShieldAlert, lucideTriangleAlert } from '@ng-icons/lucide';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { StatTile } from '../ui/stat-tile';
import { ThreatsViewModel } from './threats.view-model';

/**
 * Threat board: the headline counts and the open reports, most severe first. Read-only; the
 * reports come from the threat service through the ViewModel. A thin shell over its ViewModel.
 */
@Component({
  selector: 'app-threats',
  imports: [NgIcon, HlmBadge, HlmCardImports, StatTile],
  providers: [
    ThreatsViewModel,
    provideIcons({ lucideCheck, lucideShieldAlert, lucideTriangleAlert }),
  ],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold">Threats</h1>
        <p class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Reports not yet contained, most severe first.
          <hlm-badge variant="outline">Example data</hlm-badge>
        </p>
      </header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <app-stat-tile label="Active threats" [value]="vm.activeCount()" note="open or monitored">
          <ng-icon name="lucideShieldAlert" />
        </app-stat-tile>
        <app-stat-tile label="Critical" [value]="vm.criticalCount()" note="highest severity">
          <ng-icon name="lucideTriangleAlert" />
        </app-stat-tile>
        <app-stat-tile label="Contained" [value]="vm.containedCount()" note="no longer spreading">
          <ng-icon name="lucideCheck" />
        </app-stat-tile>
      </div>

      <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
        @for (row of vm.rows(); track row.threat.id) {
          <div hlmCard class="h-full">
            <div hlmCardHeader class="flex flex-col gap-2">
              <div class="flex flex-wrap items-center gap-2">
                <hlm-badge [variant]="row.levelVariant">{{ row.threat.level }}</hlm-badge>
                <hlm-badge [variant]="row.statusVariant">{{ row.threat.status }}</hlm-badge>
              </div>
              <h2 hlmCardTitle>{{ row.threat.title }}</h2>
              <p hlmCardDescription>{{ row.threat.id }} · {{ row.threat.region }}</p>
            </div>
            <div hlmCardContent>
              <p class="text-sm">{{ row.threat.summary }}</p>
            </div>
          </div>
        } @empty {
          <p class="text-sm text-muted-foreground">No threats are on the board.</p>
        }
      </div>
    </div>
  `,
})
export class Threats {
  protected readonly vm = inject(ThreatsViewModel);
}
