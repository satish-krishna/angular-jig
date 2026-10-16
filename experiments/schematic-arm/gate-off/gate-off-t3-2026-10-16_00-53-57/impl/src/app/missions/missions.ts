import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCheck, lucideTarget } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { statusVariant } from '../ui/hero-status-variant';
import { StatTile } from '../ui/stat-tile/stat-tile';
import { MissionsViewModel } from './missions.view-model';

/** The missions screen: roster-wide deployment totals and each hero's record. All state lives in MissionsViewModel. */
@Component({
  selector: 'app-missions',
  imports: [RouterLink, HlmBadgeImports, HlmTableImports, StatTile],
  providers: [
    MissionsViewModel,
    provideIcons({ lucideActivity, lucideCheck, lucideTarget }),
  ],
  template: `
    <div class="flex flex-col gap-8">
      <header class="min-w-0">
        <h1 class="text-2xl font-semibold">Missions</h1>
        <p class="text-sm text-muted-foreground">Deployment totals across the roster. Example data, for demonstration only.</p>
      </header>

      <section aria-label="Mission totals" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <app-stat-tile label="Missions on record" icon="lucideTarget" [value]="vm.missionsOnRecord()" />
        <app-stat-tile label="Live deployments" icon="lucideActivity" [value]="vm.liveDeployments()" />
        <app-stat-tile label="Average success" icon="lucideCheck" [value]="vm.averageSuccess() + '%'" />
      </section>

      <section aria-labelledby="mission-table-heading" class="flex flex-col gap-4">
        <h2 id="mission-table-heading" class="text-lg font-semibold">Deployment record by hero</h2>
        <div hlmTableContainer>
          <table hlmTable aria-labelledby="mission-table-heading">
            <thead hlmTHead>
              <tr hlmTr>
                <th hlmTh scope="col">Hero</th>
                <th hlmTh scope="col" class="text-end">Missions</th>
                <th hlmTh scope="col" class="text-end">Success</th>
                <th hlmTh scope="col">Status</th>
              </tr>
            </thead>
            <tbody hlmTBody>
              @for (hero of vm.rows(); track hero.id) {
                <tr hlmTr>
                  <td hlmTd>
                    <a class="font-medium underline-offset-4 hover:underline" [routerLink]="['/detail', hero.id]">{{
                      hero.name
                    }}</a>
                    <p class="text-xs text-muted-foreground">{{ hero.id }}</p>
                  </td>
                  <td hlmTd class="text-end tabular-nums">{{ hero.missionCount }}</td>
                  <td hlmTd class="text-end tabular-nums">{{ hero.successRate }}%</td>
                  <td hlmTd>
                    <span hlmBadge [variant]="statusVariant(hero.status)">{{ hero.status }}</span>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <p class="text-xs text-muted-foreground">
          The roster keeps totals only, so individual deployment entries are not listed.
        </p>
      </section>
    </div>
  `,
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
  protected readonly statusVariant = statusVariant;
}
