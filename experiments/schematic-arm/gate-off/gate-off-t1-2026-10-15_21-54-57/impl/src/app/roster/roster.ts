import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideSearch, lucideUserPlus } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { RosterViewModel } from './roster.view-model';

@Component({
  selector: 'app-roster',
  imports: [
    RouterLink,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmInputImports,
    HlmLabelImports,
    HlmSelectImports,
    HlmTableImports,
    HlmTooltipImports,
  ],
  providers: [RosterViewModel, provideIcons({ lucidePencil, lucideSearch, lucideUserPlus })],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-wrap items-start justify-between gap-4">
        <div class="flex min-w-0 flex-col gap-1">
          <h1 class="text-2xl font-semibold">Roster</h1>
          <p class="text-sm text-muted-foreground">Example data. Roster figures are illustrative.</p>
        </div>
      </header>

      <div class="flex flex-wrap items-center gap-3">
        <label hlmLabel for="roster-search" class="sr-only">Search heroes</label>
        <div class="flex min-w-0 flex-1 items-center gap-2 sm:max-w-sm">
          <ng-icon name="lucideSearch" class="shrink-0 text-muted-foreground" aria-hidden="true" />
          <input
            hlmInput
            id="roster-search"
            type="search"
            placeholder="Search name, alias or ID"
            #search
            (input)="vm.setQuery(search.value)"
          />
        </div>

        <label hlmLabel for="roster-class-filter" class="sr-only">Filter by power class</label>
        <hlm-select
          [value]="vm.classFilter()"
          [itemToString]="vm.classLabel"
          (valueChange)="vm.setClassFilter($event)"
        >
          <hlm-select-trigger buttonId="roster-class-filter" class="w-full sm:w-48">
            <hlm-select-value />
          </hlm-select-trigger>
          <hlm-select-content *hlmSelectPortal>
            @for (option of vm.classOptions; track option.value) {
              <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
            }
          </hlm-select-content>
        </hlm-select>

        <a hlmBtn class="ms-auto" [routerLink]="['/recruit']">
          <ng-icon name="lucideUserPlus" aria-hidden="true" />
          Recruit
        </a>
      </div>

      <div hlmTableContainer>
        <table hlmTable>
          <caption hlmTableCaption>Heroes on the roster, strongest first. Example data.</caption>
          <thead hlmTableHeader>
            <tr hlmTableRow>
              <th hlmTableHead scope="col">Hero</th>
              <th hlmTableHead scope="col">Class</th>
              <th hlmTableHead scope="col" class="text-right">Power</th>
              <th hlmTableHead scope="col">Status</th>
              <th hlmTableHead scope="col">Clearance</th>
              <th hlmTableHead scope="col"><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody hlmTableBody>
            @for (hero of vm.rows(); track hero.id) {
              <tr hlmTableRow>
                <td hlmTableCell>
                  <div class="flex items-center gap-3">
                    <hlm-avatar size="sm" aria-hidden="true">
                      <span hlmAvatarFallback>{{ hero.initials }}</span>
                    </hlm-avatar>
                    <div class="flex flex-col">
                      <span class="font-medium">{{ hero.name }}</span>
                      <span class="text-xs text-muted-foreground">{{ hero.id }}</span>
                    </div>
                  </div>
                </td>
                <td hlmTableCell>
                  <span hlmBadge variant="outline">{{ hero.powerClass }}</span>
                </td>
                <td hlmTableCell class="text-right tabular-nums">{{ hero.powerIndex }}</td>
                <td hlmTableCell>
                  <span hlmBadge [variant]="hero.statusVariant">{{ hero.status }}</span>
                </td>
                <td hlmTableCell class="tabular-nums">Tier {{ hero.clearance }}</td>
                <td hlmTableCell>
                  <button
                    hlmBtn
                    variant="ghost"
                    size="icon"
                    [hlmTooltip]="'Edit ' + hero.name"
                    [attr.aria-label]="'Edit ' + hero.name"
                    (click)="vm.openHero(hero)"
                  >
                    <ng-icon name="lucidePencil" aria-hidden="true" />
                  </button>
                </td>
              </tr>
            } @empty {
              <tr hlmTableRow>
                <td hlmTableCell [attr.colSpan]="6" class="text-center">No heroes match these filters.</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <footer class="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p aria-live="polite">{{ vm.rows().length }} of {{ vm.total() }} heroes</p>
        <p>Sorted by power</p>
      </footer>
    </div>
  `,
})
export class Roster {
  protected readonly vm = inject(RosterViewModel);
}
