import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucidePencil,
  lucideTrash2,
  lucideChevronDown,
  lucideSearch,
  lucideUserPlus,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { RosterViewModel } from './roster.viewmodel';

@Component({
  selector: 'app-roster',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NgIconsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmAvatarImports,
  ],
  providers: [
    RosterViewModel,
    provideIcons({
      lucidePencil,
      lucideTrash2,
      lucideChevronDown,
      lucideSearch,
      lucideUserPlus,
    }),
  ],
  template: `
    <div class="flex-1 p-6">
      <!-- Page Header -->
      <div class="mb-6 flex items-center justify-between">
        <h1 class="text-3xl font-bold text-foreground">Roster</h1>
        <a hlmBtn variant="default" [routerLink]="['/recruit']" class="flex items-center gap-2">
          <ng-icon name="lucideUserPlus" class="h-4 w-4"></ng-icon>
          <span>Recruit</span>
        </a>
      </div>

      <!-- Filter Bar -->
      <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <!-- Search Input -->
        <div class="relative flex-1">
          <ng-icon
            name="lucideSearch"
            class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          ></ng-icon>
          <input
            hlmInput
            type="search"
            placeholder="Search by name, alias, or ID..."
            [(ngModel)]="searchValue"
            (input)="onSearchChange($event)"
            class="pl-10 w-full"
          />
        </div>

        <!-- Class Filter Dropdown -->
        <select
          hlmInput
          [(ngModel)]="classFilterValue"
          (change)="onClassFilterChange($event)"
          class="w-full sm:w-48"
        >
          <option value="">All Classes</option>
          @for (powerClass of vm.powerClasses(); track powerClass) {
            <option [value]="powerClass">{{ powerClass }}</option>
          }
        </select>
      </div>

      <!-- Roster Table Container (scrollable) -->
      <div class="mb-6 overflow-x-auto rounded-lg border border-border">
        <table hlmTable class="w-full">
          <thead hlmTHead>
            <tr hlmTr class="border-b border-border">
              <th hlmTh class="h-12 px-6 py-3 text-left font-semibold text-foreground">
                HERO
              </th>
              <th hlmTh class="h-12 px-6 py-3 text-left font-semibold text-foreground">
                CLASS
              </th>
              <th hlmTh class="h-12 px-6 py-3 text-center font-semibold text-foreground">
                POWER
              </th>
              <th hlmTh class="h-12 px-6 py-3 text-center font-semibold text-foreground">
                STATUS
              </th>
              <th hlmTh class="h-12 px-6 py-3 text-center font-semibold text-foreground">
                CLEAR
              </th>
              <th hlmTh class="h-12 px-6 py-3 text-center font-semibold text-foreground">
                ACTIONS
              </th>
            </tr>
          </thead>
          <tbody hlmTBody>
            @for (hero of vm.filteredAndSortedHeroes(); track hero.id) {
              <tr hlmTr class="border-b border-border hover:bg-muted transition-colors">
                <!-- Hero Column -->
                <td hlmTd class="px-6 py-4">
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

                <!-- Class Column -->
                <td hlmTd class="px-6 py-4 text-left">
                  <span hlmBadge variant="secondary" class="inline-block">
                    {{ hero.powerClass }}
                  </span>
                </td>

                <!-- Power Column -->
                <td hlmTd class="px-6 py-4 text-center font-semibold">
                  {{ hero.powerIndex }}
                </td>

                <!-- Status Column -->
                <td hlmTd class="px-6 py-4 text-center">
                  <span
                    hlmBadge
                    [ngClass]="getStatusClass()"
                    [ngStyle]="getStatusStyle(hero.status)"
                    class="inline-block"
                  >
                    {{ hero.status }}
                  </span>
                </td>

                <!-- Clearance Column -->
                <td hlmTd class="px-6 py-4 text-center text-sm text-muted-foreground">
                  {{ hero.clearanceTier }}
                </td>

                <!-- Actions Column -->
                <td hlmTd class="px-6 py-4 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button
                      hlmBtn
                      variant="ghost"
                      size="icon"
                      [routerLink]="['/detail', hero.id]"
                      class="h-8 w-8"
                    >
                      <ng-icon name="lucidePencil" class="h-4 w-4"></ng-icon>
                    </button>
                    <button
                      hlmBtn
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8"
                      (click)="onConfirmRetire()"
                    >
                      <ng-icon name="lucideTrash2" class="h-4 w-4"></ng-icon>
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Summary Footer -->
      <div class="flex items-center justify-between text-sm text-muted-foreground">
        <span>{{ vm.heroCount() }} of {{ vm.heroes().length }} heroes</span>
        <span>sorted by power</span>
      </div>
    </div>
  `,
})
export class Roster {
  vm = inject(RosterViewModel);
  searchValue = '';
  classFilterValue = '';

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.vm.updateSearch(value);
  }

  onClassFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.vm.updateClassFilter(value as any);
  }

  onConfirmRetire(): void {
    if (confirm('Are you sure you want to retire this hero?')) {
      // TODO: implement retire
    }
  }

  getStatusClass(): string {
    return 'font-medium';
  }

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
