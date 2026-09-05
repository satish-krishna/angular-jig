import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucidePencil,
  lucideTrash2,
  lucideChevronDown,
  lucideSearch,
} from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { RosterViewModel } from './roster.viewmodel';

@Component({
  selector: 'app-roster',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    FormsModule,
    NgIconsModule,
    HlmButtonImports,
    HlmInputImports,
    HlmSelectImports,
    HlmTableImports,
    HlmBadgeImports,
    HlmAvatarImports,
    HlmTooltipImports,
  ],
  providers: [
    RosterViewModel,
    provideIcons({
      lucidePencil,
      lucideTrash2,
      lucideChevronDown,
      lucideSearch,
    }),
  ],
  template: `
    <div class="flex-1 flex flex-col overflow-auto bg-background">
      <!-- Page Header -->
      <div class="px-6 py-6 border-b border-border bg-background">
        <div class="flex items-center justify-between mb-1">
          <h1 class="text-3xl font-bold text-foreground">Roster</h1>
          <a hlmBtn variant="default" routerLink="/recruit" class="flex items-center gap-2">
            <span>+</span>
            <span>Recruit</span>
          </a>
        </div>
        <p class="text-sm text-muted-foreground">{{ vm.visibleCount() }} of {{ vm.totalCount() }} heroes</p>
      </div>

      <!-- Content -->
      <div class="flex-1 overflow-auto">
        <div class="px-6 py-6">
          <!-- Filter Bar -->
          <div class="flex flex-col sm:flex-row gap-4 mb-6">
            <div class="flex-1 relative">
              <ng-icon name="lucideSearch" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                hlmInput
                type="search"
                placeholder="Search by name, alias, or ID..."
                class="pl-10 w-full"
                [(ngModel)]="searchValue"
                (input)="onSearchChange($event)"
              />
            </div>
            <div class="min-w-[160px]">
              <select
                hlmInput
                [(ngModel)]="classFilterValue"
                (change)="onClassFilterChange($event)"
                class="w-full flex items-center"
              >
                <option value="">All Classes</option>
                <option *ngFor="let cls of vm.powerClasses()" [value]="cls">
                  {{ cls }}
                </option>
              </select>
            </div>
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
                <tr *ngFor="let hero of vm.filteredHeroes()" hlmTableRow class="border-b border-border hover:bg-muted">
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
                      [ngClass]="getStatusClass()"
                      [ngStyle]="getStatusStyle(hero.status)"
                      class="inline-block"
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
                      <button
                        hlmBtn
                        variant="ghost"
                        size="icon"
                        [routerLink]="['/detail', hero.id]"
                        [hlmTooltip]="'Edit'"
                        class="h-8 w-8"
                      >
                        <ng-icon name="lucidePencil" class="w-4 h-4" />
                      </button>
                      <button
                        hlmBtn
                        variant="ghost"
                        size="icon"
                        (click)="confirmRetire(hero.id)"
                        [hlmTooltip]="'Retire'"
                        class="h-8 w-8"
                      >
                        <ng-icon name="lucideTrash2" class="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Summary Footer -->
          <div class="flex items-center justify-between mt-6 px-4 py-3 text-sm text-muted-foreground border-t border-border">
            <span>{{ vm.visibleCount() }} of {{ vm.totalCount() }} heroes</span>
            <span>sorted by power</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
  `],
})
export class Roster {
  vm = inject(RosterViewModel);
  searchValue = '';
  classFilterValue = '';

  onSearchChange(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.vm.setSearch(value);
  }

  onClassFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.vm.setClassFilter(value);
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

  confirmRetire(heroId: string): void {
    // TODO: Show confirmation dialog before retiring
    // For now, just retire directly
    if (confirm('Are you sure you want to retire this hero?')) {
      this.vm.retire(heroId);
    }
  }
}
