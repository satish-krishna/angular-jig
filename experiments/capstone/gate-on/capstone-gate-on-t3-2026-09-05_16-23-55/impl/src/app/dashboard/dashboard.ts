import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HlmButton } from '@spartan-ng/helm/button';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucideUserCheck,
  lucideActivity,
  lucideZap,
  lucideShieldAlert,
  lucideUserPlus,
} from '@ng-icons/lucide';
import { StatTileComponent, type StatTileData } from '../ui/stat-tile.component';
import { HeroCardComponent } from '../ui/hero-card.component';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, HlmButton, NgIconsModule, StatTileComponent, HeroCardComponent],
  providers: [DashboardViewModel, provideIcons({ lucideUserCheck, lucideActivity, lucideZap, lucideShieldAlert, lucideUserPlus })],
  template: `
    <div class="flex flex-col gap-6 p-6">
      <!-- Page Header -->
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-3xl font-bold text-foreground">Operations Dashboard</h1>
          <p class="text-sm text-muted-foreground">Mission readiness and hero status</p>
        </div>
        <a hlmBtn routerLink="/recruit" class="flex items-center gap-2">
          <ng-icon name="lucideUserPlus" />
          <span>Recruit</span>
        </a>
      </div>

      <!-- Stats Row -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-tile [data]="getHeroesStatData()" />
        <app-stat-tile [data]="getMissionsStatData()" />
        <app-stat-tile [data]="getAveragePowerStatData()" />
        <app-stat-tile [data]="getThreatsStatData()" />
      </div>

      <!-- Top Heroes Section -->
      <div class="flex items-center justify-between">
        <h2 class="text-lg font-semibold text-foreground">Top heroes this cycle</h2>
        <a routerLink="/roster" class="text-sm text-primary hover:underline">View all roster</a>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        @for (hero of vm.topHeroes(); track hero.id) {
          <app-hero-card [hero]="hero" />
        }
      </div>

      <!-- Roster Table Section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-foreground">Roster</h2>
          <span class="text-sm text-muted-foreground">{{ vm.heroCount() }} heroes</span>
        </div>

        <div class="overflow-x-auto">
          <div class="inline-block min-w-full">
            <div class="grid grid-cols-1 gap-2">
              @for (hero of vm.allHeroes(); track hero.id) {
                <div class="flex items-center gap-2 p-3 bg-card border border-border rounded-lg">
                  <div class="flex-1 text-sm font-medium text-foreground">{{ hero.name }}</div>
                  <span class="text-xs text-muted-foreground">{{ hero.powerIndex }}</span>
                </div>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);

  getHeroesStatData(): StatTileData {
    return {
      label: 'Heroes',
      value: this.vm.activeHeroes(),
      icon: 'lucideUserCheck',
      trend: { value: '+2', direction: 'up' },
    };
  }

  getMissionsStatData(): StatTileData {
    return {
      label: 'Missions Live',
      value: this.vm.activeMissionsCount(),
      icon: 'lucideActivity',
      trend: { value: '3 pending', direction: 'neutral' },
    };
  }

  getAveragePowerStatData(): StatTileData {
    return {
      label: 'Average Power',
      value: this.vm.averagePower(),
      icon: 'lucideZap',
    };
  }

  getThreatsStatData(): StatTileData {
    return {
      label: 'Active Threats',
      value: this.vm.threatsCount(),
      icon: 'lucideShieldAlert',
      trend: { value: '1 critical', direction: 'down' },
    };
  }
}

