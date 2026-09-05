import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconsModule } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { DashboardViewModel } from './dashboard.viewmodel';
import { StatTile } from '../ui/stat-tile';
import { HeroCard } from '../ui/hero-card';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIconsModule,
    HlmButton,
    StatTile,
    HeroCard,
  ],
  providers: [DashboardViewModel],
  template: `
    <div class="flex-1 p-6">
      <!-- Page Header -->
      <div class="mb-8 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-foreground">Operations Dashboard</h1>
        <a hlmBtn [routerLink]="['/recruit']" class="gap-2">
          <ng-icon name="lucideUserPlus" class="h-4 w-4"></ng-icon>
          <span>Recruit</span>
        </a>
      </div>

      <!-- Stat Tiles -->
      <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <app-stat-tile
          label="Active Heroes"
          [value]="vm.heroCount()"
          icon="lucideUserCheck"
        />
        <app-stat-tile
          label="Missions Live"
          [value]="vm.missionsLive()"
          icon="lucideActivity"
        />
        <app-stat-tile
          label="Average Power"
          [value]="vm.avgPower()"
          icon="lucideZap"
        />
        <app-stat-tile
          label="Threats"
          [value]="vm.threatCount()"
          icon="lucideShieldAlert"
        />
      </div>

      <!-- Top Heroes Section -->
      <div class="mb-8">
        <div class="mb-4 flex items-center justify-between">
          <h2 class="text-xl font-bold text-foreground">Top Heroes This Cycle</h2>
          <a [routerLink]="['/roster']" class="text-sm text-primary hover:text-primary/80">
            View all roster →
          </a>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          @for (hero of vm.topHeroes(); track hero.id) {
            <app-hero-card [hero]="hero" />
          }
        </div>
      </div>

      <!-- Roster Section Heading -->
      <div class="border-t border-border pt-8">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-bold text-foreground">Roster</h2>
          <span class="text-sm text-muted-foreground">{{ vm.heroCount() }} heroes</span>
        </div>
      </div>
    </div>
  `,
})
export class Dashboard {
  vm = inject(DashboardViewModel);
}
