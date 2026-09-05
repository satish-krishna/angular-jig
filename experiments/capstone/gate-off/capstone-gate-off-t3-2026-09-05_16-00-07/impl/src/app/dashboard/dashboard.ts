import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmBadge } from '@spartan-ng/helm/badge';
import {
  HlmTable,
  HlmTHead,
  HlmTBody,
  HlmTr,
  HlmTh,
  HlmTd,
} from '@spartan-ng/helm/table';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { StatTile } from '../ui/stat-tile';
import { HeroCard } from '../ui/hero-card';
import { DashboardViewModel } from './dashboard.viewmodel';
import type { HeroStatus } from '../domain/hero.model';

@Component({
  selector: 'app-dashboard',
  imports: [
    RouterLink,
    NgIcon,
    HlmButton,
    HlmBadge,
    HlmTable,
    HlmTHead,
    HlmTBody,
    HlmTr,
    HlmTh,
    HlmTd,
    HlmAvatar,
    HlmAvatarFallback,
    StatTile,
    HeroCard,
  ],
  providers: [DashboardViewModel],
  template: `
    <div class="flex flex-col gap-8 p-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold text-foreground">Operations Dashboard</h1>
        <button
          hlmBtn
          variant="default"
          routerLink="/recruit"
          class="flex items-center gap-2"
        >
          <ng-icon name="lucideUserPlus" class="size-5" />
          <span>Recruit</span>
        </button>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <app-stat-tile
          [label]="'Heroes'"
          [value]="vm.totalHeroes()"
          icon="lucideUserCheck"
        />
        <app-stat-tile
          [label]="'Missions Live'"
          [value]="vm.missionsLive()"
          icon="lucideActivity"
        />
        <app-stat-tile
          [label]="'Avg Power'"
          [value]="vm.averagePower()"
          icon="lucideZap"
        />
        <app-stat-tile
          [label]="'Threats'"
          [value]="vm.threatsActive()"
          icon="lucideShieldAlert"
        />
      </div>

      <!-- Top Heroes Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-foreground">Top heroes this cycle</h2>
          <a
            routerLink="/roster"
            class="text-sm font-medium text-primary hover:underline"
          >
            View all roster
          </a>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (hero of vm.topHeroes(); track hero.id) {
            <app-hero-card [hero]="hero" />
          }
        </div>
      </div>

      <!-- Roster Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between border-t border-border pt-6">
          <h2 class="text-xl font-semibold text-foreground">Roster</h2>
          <span class="text-sm font-medium text-muted-foreground">
            {{ vm.totalHeroes() }} heroes
          </span>
        </div>

        <!-- Roster Table (desktop) -->
        <div class="hidden sm:block bg-card rounded-lg border border-border overflow-hidden">
          <div class="overflow-x-auto">
            <table hlmTable>
              <thead hlmTHead>
                <tr hlmTr>
                  <th hlmTh>Hero</th>
                  <th hlmTh class="text-center">Class</th>
                  <th hlmTh class="text-center">Power</th>
                  <th hlmTh class="text-center">Status</th>
                  <th hlmTh class="text-center">Clearance</th>
                </tr>
              </thead>
              <tbody hlmTBody>
                @for (hero of vm.heroes(); track hero.id) {
                  <tr hlmTr class="cursor-pointer hover:bg-muted/50" [routerLink]="['/detail', hero.id]">
                    <td hlmTd class="font-medium">
                      <div class="flex items-center gap-3">
                        <div hlmAvatar class="size-8">
                          <div
                            hlmAvatarFallback
                            class="bg-primary text-primary-foreground font-bold text-xs"
                          >
                            {{ hero.name.substring(0, 2).toUpperCase() }}
                          </div>
                        </div>
                        <div class="flex flex-col gap-1">
                          <div class="font-semibold text-foreground text-sm">{{ hero.name }}</div>
                          <div class="text-xs text-muted-foreground">{{ hero.id }}</div>
                        </div>
                      </div>
                    </td>
                    <td hlmTd class="text-center">
                      <span hlmBadge variant="outline" class="text-xs">
                        {{ hero.powerClass }}
                      </span>
                    </td>
                    <td hlmTd class="text-center font-bold text-primary">
                      {{ hero.powerIndex }}
                    </td>
                    <td hlmTd class="text-center">
                      <span
                        hlmBadge
                        [variant]="statusVariant(hero.status)"
                        class="text-xs"
                      >
                        {{ hero.status }}
                      </span>
                    </td>
                    <td hlmTd class="text-center text-sm font-medium">
                      {{ hero.clearanceTier }}
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <!-- Roster Cards (mobile) -->
        <div class="grid grid-cols-1 sm:hidden gap-4">
          @for (hero of vm.heroes(); track hero.id) {
            <a [routerLink]="['/detail', hero.id]" class="block">
              <div class="bg-card rounded-lg border border-border p-4 hover:ring-2 hover:ring-primary transition-all">
                <div class="flex items-start gap-3 mb-3">
                  <div hlmAvatar>
                    <div
                      hlmAvatarFallback
                      class="bg-primary text-primary-foreground font-bold"
                    >
                      {{ hero.name.substring(0, 2).toUpperCase() }}
                    </div>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="font-bold text-foreground truncate">{{ hero.name }}</div>
                    <div class="text-xs text-muted-foreground truncate">{{ hero.alias }}</div>
                  </div>
                </div>
                <div class="grid grid-cols-2 gap-2">
                  <div class="flex items-center gap-2 bg-muted/50 rounded p-2">
                    <ng-icon name="lucideZap" class="size-4 text-primary flex-shrink-0" />
                    <span class="font-bold text-primary text-sm">{{ hero.powerIndex }}</span>
                  </div>
                  <div class="flex items-center justify-center">
                    <span hlmBadge [variant]="statusVariant(hero.status)" class="text-xs">
                      {{ hero.status }}
                    </span>
                  </div>
                </div>
              </div>
            </a>
          }
        </div>
      </div>
    </div>
  `,
})
export class Dashboard {
  readonly vm = inject(DashboardViewModel);

  statusVariant(status: HeroStatus): 'default' | 'secondary' | 'outline' {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Injured':
        return 'secondary';
      case 'Reserve':
      case 'MIA':
        return 'outline';
    }
  }
}
