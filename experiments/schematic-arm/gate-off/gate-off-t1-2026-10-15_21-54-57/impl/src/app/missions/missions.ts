import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideCrosshair } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { StatTile } from '../ui/stat-tile';
import { MissionsViewModel } from './missions.view-model';

@Component({
  selector: 'app-missions',
  imports: [
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    HlmTooltipImports,
    StatTile,
  ],
  providers: [MissionsViewModel, provideIcons({ lucideCrosshair })],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex min-w-0 flex-col gap-1">
        <h1 class="text-2xl font-semibold">Missions</h1>
        <p class="text-sm text-muted-foreground">
          Deployments by hero. Only Active heroes can be sent out. Example data.
        </p>
      </header>

      <section aria-label="Mission summary" class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        @for (stat of vm.stats(); track stat.label) {
          <app-stat-tile
            [label]="stat.label"
            [value]="stat.value"
            [hint]="stat.hint"
            [icon]="stat.icon"
          />
        }
      </section>

      <p aria-live="polite" class="text-sm text-muted-foreground">{{ vm.notice() }}</p>

      <div hlmTableContainer>
        <table hlmTable>
          <caption hlmTableCaption>Missions by hero, most deployments first. Example data.</caption>
          <thead hlmTableHeader>
            <tr hlmTableRow>
              <th hlmTableHead scope="col">Hero</th>
              <th hlmTableHead scope="col">Status</th>
              <th hlmTableHead scope="col" class="text-right">Missions</th>
              <th hlmTableHead scope="col" class="text-right">Success</th>
              <th hlmTableHead scope="col"><span class="sr-only">Deploy</span></th>
            </tr>
          </thead>
          <tbody hlmTableBody>
            @for (hero of vm.rows(); track hero.id) {
              <tr hlmTableRow>
                <td hlmTableCell>
                  <div class="flex items-center gap-3">
                    <hlm-avatar size="sm" aria-hidden="true">
                      <span hlmAvatarFallback>{{ hero.initials }}</span>
                    </hlm-avatar>
                    <div class="flex flex-col">
                      <span class="font-medium">{{ hero.name }}</span>
                      <span class="text-xs text-muted-foreground">{{ hero.id }}</span>
                    </div>
                  </div>
                </td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="hero.statusVariant">{{ hero.status }}</span>
                </td>
                <td hlmTableCell class="text-right tabular-nums">{{ hero.missions }}</td>
                <td hlmTableCell class="text-right tabular-nums">{{ hero.successRate }}%</td>
                <td hlmTableCell>
                  <button
                    hlmBtn
                    variant="outline"
                    size="sm"
                    [disabled]="!hero.canDeploy"
                    [attr.aria-label]="'Deploy ' + hero.name"
                    [hlmTooltip]="hero.canDeploy ? 'Deploy ' + hero.name : hero.name + ' is not Active'"
                    (click)="vm.deploy(hero)"
                  >
                    <ng-icon name="lucideCrosshair" aria-hidden="true" />
                    Deploy
                  </button>
                </td>
              </tr>
            } @empty {
              <tr hlmTableRow>
                <td hlmTableCell [attr.colSpan]="5" class="text-center">No heroes on the roster.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>
  `,
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
}
