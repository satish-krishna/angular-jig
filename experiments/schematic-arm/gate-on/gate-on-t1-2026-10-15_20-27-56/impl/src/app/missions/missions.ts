import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCheck, lucideCrosshair, lucideUserCheck } from '@ng-icons/lucide';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import type { HeroStatus } from '../domain/hero.model';
import { HERO_STATUS_VARIANT } from '../ui/hero-presentation';
import { StatTile } from '../ui/stat-tile';
import { MissionsViewModel } from './missions.view-model';

@Component({
  selector: 'app-missions',
  imports: [NgIcon, ...HlmBadgeImports, ...HlmButtonImports, StatTile],
  providers: [
    MissionsViewModel,
    provideIcons({ lucideActivity, lucideCheck, lucideCrosshair, lucideUserCheck }),
  ],
  template: `
    <section class="flex flex-col gap-6">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold">Missions</h1>
        <p class="text-sm text-muted-foreground">
          Send Active heroes out. Each deployment is added to the hero's record and the dashboard.
        </p>
      </header>

      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <app-stat-tile label="Missions on record" [value]="vm.missionsOnRecord()" hint="Across the roster">
          <ng-icon statIcon name="lucideActivity" />
        </app-stat-tile>
        <app-stat-tile label="Ready to deploy" [value]="vm.deployable().length" hint="Active heroes">
          <ng-icon statIcon name="lucideUserCheck" />
        </app-stat-tile>
        <app-stat-tile label="Average success" [value]="vm.averageSuccess() + '%'" hint="Across the roster">
          <ng-icon statIcon name="lucideCheck" />
        </app-stat-tile>
      </div>

      @if (vm.notice()) {
        <p role="status" class="text-sm text-muted-foreground">{{ vm.notice() }}</p>
      }

      <section aria-labelledby="ready-heading" class="flex flex-col gap-3">
        <h2 id="ready-heading" class="text-lg font-semibold">Ready to deploy</h2>
        @if (vm.deployable().length === 0) {
          <p class="text-sm text-muted-foreground">No Active heroes are available for deployment.</p>
        }
        <ul class="flex flex-col gap-3">
          @for (hero of vm.deployable(); track hero.id) {
            <li class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-3">
              <div class="flex min-w-0 flex-col">
                <span class="font-medium break-words">{{ hero.name }}</span>
                <span class="text-xs text-muted-foreground">
                  {{ hero.id }} · {{ hero.powerClass }} · {{ hero.missions }} missions
                </span>
              </div>
              <button hlmBtn size="sm" type="button" (click)="vm.deploy(hero)">
                <ng-icon name="lucideCrosshair" />
                Deploy {{ hero.name }}
              </button>
            </li>
          }
        </ul>
      </section>

      <section aria-labelledby="benched-heading" class="flex flex-col gap-3">
        <h2 id="benched-heading" class="text-lg font-semibold">Not deployable</h2>
        <ul class="flex flex-col gap-3">
          @for (hero of vm.benched(); track hero.id) {
            <li class="flex flex-wrap items-center justify-between gap-3 rounded-md border border-border bg-card p-3">
              <div class="flex min-w-0 flex-col">
                <span class="font-medium break-words">{{ hero.name }}</span>
                <span class="text-xs text-muted-foreground">{{ hero.id }} · {{ hero.powerClass }}</span>
              </div>
              <span hlmBadge [variant]="statusVariant(hero.status)">{{ hero.status }}</span>
            </li>
          }
        </ul>
      </section>
    </section>
  `,
})
export class Missions {
  protected readonly vm = inject(MissionsViewModel);
  protected readonly statusVariant = (status: HeroStatus) => HERO_STATUS_VARIANT[status];
}
