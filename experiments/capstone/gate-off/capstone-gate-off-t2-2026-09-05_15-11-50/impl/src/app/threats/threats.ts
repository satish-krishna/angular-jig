import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucideShieldAlert,
  lucideAlertTriangle,
  lucideActivity,
  lucidePencil,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HeroService } from '../domain/hero.service';

@Component({
  selector: 'app-threats',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NgIconsModule,
    HlmButtonImports,
    HlmCardImports,
    HlmBadgeImports,
    HlmAvatarImports,
    HlmTableImports,
  ],
  providers: [
    provideIcons({
      lucideShieldAlert,
      lucideAlertTriangle,
      lucideActivity,
      lucidePencil,
    }),
  ],
  template: `
    <div class="flex-1 overflow-y-auto p-6">
      <!-- Page Header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-2">
          <ng-icon name="lucideShieldAlert" class="h-8 w-8 text-warning"></ng-icon>
          <h1 class="text-3xl font-bold text-foreground">Threat Assessment</h1>
        </div>
        <p class="text-muted-foreground">Monitor agents with compromised status or critical missions</p>
      </div>

      <!-- Stats Grid -->
      <div class="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <!-- Injured Count -->
        <div hlmCard class="p-4">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-warning/10">
              <ng-icon name="lucideAlertTriangle" class="h-6 w-6 text-warning"></ng-icon>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Injured Heroes</p>
              <p class="text-2xl font-bold text-foreground">{{ injuredCount() }}</p>
            </div>
          </div>
        </div>

        <!-- MIA Count -->
        <div hlmCard class="p-4">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <ng-icon name="lucideShieldAlert" class="h-6 w-6 text-destructive"></ng-icon>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">MIA Heroes</p>
              <p class="text-2xl font-bold text-foreground">{{ miaCount() }}</p>
            </div>
          </div>
        </div>

        <!-- Total Threats -->
        <div hlmCard class="p-4 sm:col-span-2 lg:col-span-1">
          <div class="flex items-center gap-4">
            <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-destructive/10">
              <ng-icon name="lucideActivity" class="h-6 w-6 text-destructive"></ng-icon>
            </div>
            <div>
              <p class="text-xs text-muted-foreground">Total Threats</p>
              <p class="text-2xl font-bold text-foreground">{{ threatCount() }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Threats Table -->
      <div hlmCard class="mb-6 overflow-x-auto">
        <div class="p-6">
          <h2 class="mb-4 text-lg font-semibold text-foreground">Threatened Agents</h2>

          @if (threatHeroes().length > 0) {
            <div class="overflow-x-auto">
              <table hlmTable class="w-full">
                <thead hlmTHead>
                  <tr hlmTr class="border-b border-border">
                    <th hlmTh class="h-12 px-4 py-3 text-left font-semibold text-foreground">
                      AGENT
                    </th>
                    <th hlmTh class="h-12 px-4 py-3 text-left font-semibold text-foreground">
                      STATUS
                    </th>
                    <th hlmTh class="h-12 px-4 py-3 text-center font-semibold text-foreground">
                      CLASS
                    </th>
                    <th hlmTh class="h-12 px-4 py-3 text-center font-semibold text-foreground">
                      POWER
                    </th>
                    <th hlmTh class="h-12 px-4 py-3 text-center font-semibold text-foreground">
                      ACTIONS
                    </th>
                  </tr>
                </thead>
                <tbody hlmTBody>
                  @for (hero of threatHeroes(); track hero.id) {
                    <tr hlmTr class="border-b border-border hover:bg-muted transition-colors">
                      <td hlmTd class="px-4 py-4">
                        <div class="flex items-center gap-3">
                          <div hlmAvatar class="h-10 w-10">
                            <img
                              hlmAvatarImage
                              [src]="'https://api.dicebear.com/7.x/avataaars/svg?seed=' + hero.id"
                              [alt]="hero.name"
                            />
                          </div>
                          <div class="min-w-0">
                            <p class="text-sm font-medium text-foreground">{{ hero.name }}</p>
                            <p class="text-xs text-muted-foreground">{{ hero.id }}</p>
                          </div>
                        </div>
                      </td>
                      <td hlmTd class="px-4 py-4">
                        <span
                          hlmBadge
                          [ngStyle]="getStatusStyle(hero.status)"
                          class="inline-block font-medium"
                        >
                          {{ hero.status }}
                        </span>
                      </td>
                      <td hlmTd class="px-4 py-4 text-center">
                        <span hlmBadge variant="secondary">
                          {{ hero.powerClass }}
                        </span>
                      </td>
                      <td hlmTd class="px-4 py-4 text-center font-semibold">
                        {{ hero.powerIndex }}
                      </td>
                      <td hlmTd class="px-4 py-4 text-center">
                        <a
                          hlmBtn
                          variant="ghost"
                          size="icon"
                          [routerLink]="['/detail', hero.id]"
                          class="h-8 w-8"
                        >
                          <ng-icon name="lucidePencil" class="h-4 w-4"></ng-icon>
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          } @else {
            <p class="py-8 text-center text-muted-foreground">
              All agents are operating nominally. No threats detected.
            </p>
          }
        </div>
      </div>
    </div>
  `,
})
export class Threats {
  private heroService = inject(HeroService);

  heroes = this.heroService.heroes$;

  threatHeroes = computed(() => {
    return this.heroes().filter(h => h.status === 'Injured' || h.status === 'MIA');
  });

  injuredCount = computed(() => {
    return this.heroes().filter(h => h.status === 'Injured').length;
  });

  miaCount = computed(() => {
    return this.heroes().filter(h => h.status === 'MIA').length;
  });

  threatCount = computed(() => this.threatHeroes().length);

  getStatusStyle(status: string): { [key: string]: string } {
    const styles: { [key: string]: { color: string; bg: string } } = {
      Injured: { color: 'var(--warning)', bg: 'rgba(228, 128, 43, 0.1)' },
      MIA: { color: 'var(--destructive)', bg: 'rgba(229, 72, 77, 0.1)' },
    };
    return styles[status] || { color: 'var(--foreground)', bg: 'transparent' };
  }
}
