import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { StatTile } from '../ui/stat-tile';
import { HeroCard } from '../ui/hero-card';
import { DashboardViewModel } from './dashboard.view-model';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="flex flex-col gap-8 p-6">
      <!-- Page header -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Operations Dashboard</h1>
        <a routerLink="/recruit" hlmBtn>
          <ng-icon name="lucideUserPlus" />
          <span>Recruit</span>
        </a>
      </div>

      <!-- Stat tiles grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <app-stat-tile label="Total Heroes" [value]="vm.totalHeroes()" icon="lucideUserCheck" />
        <app-stat-tile label="Missions Live" [value]="vm.missionsLive()" icon="lucideActivity" />
        <app-stat-tile label="Avg Power" [value]="vm.averagePower()" icon="lucideZap" />
        <app-stat-tile label="Threats" [value]="vm.threatCount()" icon="lucideShieldAlert" />
      </div>

      <!-- Top heroes section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold">Top heroes this cycle</h2>
          <a routerLink="/roster" class="text-sm text-primary hover:underline">View all roster</a>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          @for (hero of vm.topHeroes(); track hero.id) {
            <app-hero-card [hero]="hero" />
          }
        </div>
      </div>

      <!-- Full Roster table section -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between pt-8 border-t border-border">
          <h2 class="text-xl font-semibold">Roster</h2>
          <span class="text-sm text-muted-foreground">{{ vm.totalHeroes() }} heroes</span>
        </div>

        <!-- Desktop table view -->
        <div class="hidden sm:block overflow-x-auto">
          <table hlmTable>
            <thead hlmTableHeader>
              <tr hlmTableRow>
                <th hlmTableHead>Hero</th>
                <th hlmTableHead>Class</th>
                <th hlmTableHead>Power</th>
                <th hlmTableHead>Status</th>
                <th hlmTableHead>Clearance</th>
                <th hlmTableHead>Actions</th>
              </tr>
            </thead>
            <tbody hlmTableBody>
              @for (hero of vm.sortedHeroes(); track hero.id) {
                <tr hlmTableRow>
                  <td hlmTableCell>
                    <div class="flex items-center gap-3">
                      <div hlmAvatar>
                        {{ getInitials(hero.name) }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div>{{ hero.name }}</div>
                        <div class="text-muted-foreground">{{ hero.id }}</div>
                      </div>
                    </div>
                  </td>
                  <td hlmTableCell>
                    <div hlmBadge variant="outline">{{ hero.powerClass }}</div>
                  </td>
                  <td hlmTableCell>
                    <div>{{ hero.powerIndex }}</div>
                  </td>
                  <td hlmTableCell>
                    <div hlmBadge [variant]="getStatusVariant(hero.status)">
                      {{ hero.status }}
                    </div>
                  </td>
                  <td hlmTableCell>
                    <div>{{ hero.clearanceTier }}</div>
                  </td>
                  <td hlmTableCell>
                    <div class="flex items-center justify-center gap-2">
                      <a [routerLink]="['/detail', hero.id]" hlmBtn variant="ghost" size="sm" [attr.aria-label]="'Edit ' + hero.name">
                        <ng-icon name="lucidePencil" />
                      </a>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [
    RouterLink,
    NgIcon,
    HlmButton,
    HlmCardImports,
    HlmBadge,
    HlmTableImports,
    HlmAvatarImports,
    StatTile,
    HeroCard,
  ],
  providers: [DashboardViewModel],
})
export class Dashboard {
  protected readonly vm = inject(DashboardViewModel);

  getInitials(name: string): string {
    const parts = name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase();
  }

  getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Injured':
        return 'secondary';
      case 'MIA':
        return 'destructive';
      case 'Reserve':
        return 'outline';
      default:
        return 'default';
    }
  }
}
