import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { RosterViewModel } from './roster.view-model';

@Component({
  selector: 'app-heroes',
  template: `
    <div class="flex flex-col gap-6 p-6">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">Roster</h1>
        <button hlmBtn>
          <ng-icon name="lucideUserPlus" />
          <span>Recruit</span>
        </button>
      </div>

      <!-- Filter bar -->
      <div class="flex flex-col sm:flex-row gap-4">
        <div class="search-input-wrapper flex-1">
          <ng-icon name="lucideSearch" class="search-icon text-muted-foreground" />
          <input
            hlmInput
            type="text"
            placeholder="Search heroes..."
            [value]="vm.searchQuery()"
            (input)="vm.searchQuery.set($any($event.target).value)"
          />
        </div>

        <hlm-select [value]="vm.selectedClass()" (change)="vm.selectedClass.set($any($event))">
          <hlm-select-trigger class="w-full sm:w-40">
            <hlm-select-value />
          </hlm-select-trigger>
          <hlm-select-content>
            <hlm-select-item value="all">All Classes</hlm-select-item>
            @for (cls of vm.availableClasses(); track cls) {
              <hlm-select-item [value]="cls">{{ cls }}</hlm-select-item>
            }
          </hlm-select-content>
        </hlm-select>
      </div>

      <!-- Desktop table view (hidden below 640px) -->
      <div class="hidden sm:block">
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
                    <button hlmBtn variant="ghost" size="sm" [attr.aria-label]="'Delete ' + hero.name">
                      <ng-icon name="lucideTrash2" />
                    </button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <!-- Mobile card view (shown below 640px) -->
      <div class="sm:hidden flex flex-col gap-4">
        @for (hero of vm.sortedHeroes(); track hero.id) {
          <a [routerLink]="['/detail', hero.id]" class="block">
            <div class="bg-card border border-border rounded-lg p-4">
              <div class="flex items-start gap-3 mb-3">
                <div hlmAvatar>
                  {{ getInitials(hero.name) }}
                </div>
                <div class="flex-1 min-w-0">
                  <div>{{ hero.name }}</div>
                  <div class="text-muted-foreground">{{ hero.id }}</div>
                </div>
              </div>

              <div class="flex flex-col gap-3">
                <div class="flex justify-between">
                  <span class="text-muted-foreground">Power:</span>
                  <span>{{ hero.powerIndex }}</span>
                </div>
                <div class="flex gap-2 flex-wrap">
                  <div hlmBadge variant="outline">{{ hero.powerClass }}</div>
                  <div hlmBadge [variant]="getStatusVariant(hero.status)">
                    {{ hero.status }}
                  </div>
                  <div hlmBadge variant="secondary">{{ hero.clearanceTier }}</div>
                </div>
                <div class="flex justify-between border-t border-border pt-3 text-muted-foreground">
                  <span>{{ hero.missionCount }} missions</span>
                  <span>{{ hero.successRate }}% success</span>
                </div>
              </div>
            </div>
          </a>
        }
      </div>

      <!-- Summary footer -->
      <div class="flex items-center justify-between border-t border-border pt-4 text-muted-foreground">
        <span>{{ vm.heroCount() }} of {{ heroes().length }} heroes</span>
        <span>sorted by power</span>
      </div>
    </div>
  `,
  styleUrl: './heroes.css',
  standalone: true,
  imports: [
    RouterLink,
    NgIcon,
    HlmButton,
    HlmInput,
    HlmBadge,
    HlmSelectImports,
    HlmTableImports,
    HlmAvatarImports,
  ],
  providers: [RosterViewModel],
})
export class Heroes {
  protected readonly vm = inject(RosterViewModel);
  protected readonly heroes = this.vm.heroes;

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
