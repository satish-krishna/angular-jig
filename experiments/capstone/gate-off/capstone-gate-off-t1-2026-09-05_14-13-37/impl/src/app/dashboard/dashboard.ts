import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucideUserCheck,
  lucideActivity,
  lucideZap,
  lucideShieldAlert,
  lucidePencil,
  lucideTrash2,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
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
    HlmButtonImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmAvatarImports,
    HlmTooltipImports,
    StatTile,
    HeroCard,
  ],
  providers: [
    DashboardViewModel,
    provideIcons({
      lucideUserCheck,
      lucideActivity,
      lucideZap,
      lucideShieldAlert,
      lucidePencil,
      lucideTrash2,
    }),
  ],
  template: `
    <div class="flex-1 flex flex-col overflow-auto bg-background">
      <!-- Page Header -->
      <div class="px-6 py-6 border-b border-border bg-background">
        <div class="flex items-center justify-between mb-1">
          <h1 class="text-3xl font-bold text-foreground">Operations Dashboard</h1>
          <a hlmBtn variant="default" routerLink="/recruit" class="flex items-center gap-2">
            <span>+</span>
            <span>Recruit</span>
          </a>
        </div>
        <p class="text-sm text-muted-foreground">Real-time hero roster and threat monitoring</p>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto">
        <div class="px-6 py-6">
          <!-- Stat Tiles Grid -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <app-stat-tile
              [label]="'Heroes'"
              [value]="vm.heroCount()"
              icon="lucideUserCheck"
              [trend]="5"
            />
            <app-stat-tile
              [label]="'Active Missions'"
              [value]="vm.activeMissions()"
              icon="lucideActivity"
              [trend]="12"
            />
            <app-stat-tile
              [label]="'Avg Power'"
              [value]="vm.avgPower()"
              icon="lucideZap"
              [trend]="-3"
            />
            <app-stat-tile
              [label]="'Threats'"
              [value]="vm.threatCount()"
              icon="lucideShieldAlert"
              [trend]="2"
            />
          </div>

          <!-- Top Heroes Section -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-foreground">Top Heroes This Cycle</h2>
              <a routerLink="/roster" class="text-sm text-primary hover:underline">
                View all roster
              </a>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <app-hero-card
                *ngFor="let hero of vm.topHeroes()"
                [hero]="hero"
                [routerLink]="['/detail', hero.id]"
                class="cursor-pointer"
              />
            </div>
          </div>

          <!-- Roster Section -->
          <div class="mb-8">
            <div class="flex items-center justify-between mb-4">
              <h2 class="text-xl font-bold text-foreground">Roster</h2>
              <span class="text-sm text-muted-foreground">{{ vm.heroCount() }} heroes</span>
            </div>

            <!-- Roster Table -->
            <div class="overflow-x-auto border rounded-lg border-border">
              <table hlmTable class="w-full">
                <thead hlmTableHead>
                  <tr hlmTableRow class="border-b border-border">
                    <th hlmTableHeader class="text-left px-6 py-3 font-semibold text-foreground min-w-[200px]">
                      HERO
                    </th>
                    <th hlmTableHeader class="text-left px-6 py-3 font-semibold text-foreground min-w-[100px]">
                      CLASS
                    </th>
                    <th hlmTableHeader class="text-center px-6 py-3 font-semibold text-foreground min-w-[80px]">
                      POWER
                    </th>
                    <th hlmTableHeader class="text-center px-6 py-3 font-semibold text-foreground min-w-[100px]">
                      STATUS
                    </th>
                    <th hlmTableHeader class="text-center px-6 py-3 font-semibold text-foreground min-w-[80px]">
                      CLEAR
                    </th>
                    <th hlmTableHeader class="text-center px-6 py-3 font-semibold text-foreground min-w-[100px]">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody hlmTableBody>
                  <tr *ngFor="let hero of vm.heroes()" hlmTableRow class="border-b border-border hover:bg-muted">
                    <!-- Hero Name & Avatar -->
                    <td hlmTableCell class="px-6 py-4">
                      <div class="flex items-center gap-3">
                        <hlm-avatar class="h-8 w-8">
                          <span hlmAvatarFallback class="text-xs">{{ hero.name.substring(0, 2).toUpperCase() }}</span>
                        </hlm-avatar>
                        <div>
                          <div class="font-semibold text-foreground">{{ hero.name }}</div>
                          <div class="text-xs text-muted-foreground">{{ hero.id }}</div>
                        </div>
                      </div>
                    </td>

                    <!-- Class Badge -->
                    <td hlmTableCell class="px-6 py-4 text-center">
                      <span hlmBadge variant="secondary" class="inline-block">
                        {{ hero.powerClass }}
                      </span>
                    </td>

                    <!-- Power Index -->
                    <td hlmTableCell class="px-6 py-4 text-center font-semibold">
                      {{ hero.powerIndex }}
                    </td>

                    <!-- Status Pill -->
                    <td hlmTableCell class="px-6 py-4 text-center">
                      <span
                        hlmBadge
                        [ngStyle]="getStatusStyle(hero.status)"
                        class="inline-block font-medium"
                      >
                        {{ hero.status }}
                      </span>
                    </td>

                    <!-- Clearance Tier -->
                    <td hlmTableCell class="px-6 py-4 text-center text-sm text-muted-foreground">
                      {{ hero.clearanceTier }}
                    </td>

                    <!-- Actions -->
                    <td hlmTableCell class="px-6 py-4 text-center">
                      <div class="flex items-center justify-center gap-2">
                        <a
                          [routerLink]="['/detail', hero.id]"
                          hlmBtn
                          variant="ghost"
                          size="icon"
                          [hlmTooltip]="'View'"
                          class="h-8 w-8"
                        >
                          <ng-icon name="lucidePencil" class="w-4 h-4" />
                        </a>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Summary Footer -->
            <div class="flex items-center justify-between mt-6 px-4 py-3 text-sm text-muted-foreground border-t border-border">
              <span>{{ vm.heroCount() }} heroes</span>
              <span>sorted by power</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        height: 100%;
      }
    `,
  ],
})
export class Dashboard {
  vm = inject(DashboardViewModel);

  getStatusStyle(status: string): { [key: string]: string } {
    const styles: { [key: string]: { color: string; bg: string } } = {
      Active: { color: 'var(--success)', bg: 'rgba(47, 181, 116, 0.1)' },
      Injured: { color: 'var(--warning)', bg: 'rgba(228, 128, 43, 0.1)' },
      Reserve: { color: 'var(--muted-foreground)', bg: 'rgba(91, 96, 114, 0.1)' },
      MIA: { color: 'var(--destructive)', bg: 'rgba(229, 72, 77, 0.1)' },
    };
    const style = styles[status] || { color: 'var(--foreground)', bg: 'transparent' };
    return { color: style.color, backgroundColor: style.bg };
  }
}
