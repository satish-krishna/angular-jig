import { Component, inject } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideSearch, lucideUserPlus } from '@ng-icons/lucide';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmInput } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { RouterLink } from '@angular/router';
import { RosterViewModel } from './heroes.view-model';

/**
 * Roster screen: the filter bar (search and class filter), the roster table, and the summary
 * footer. The table scrolls inside its own container at narrow widths; the page never does.
 * A thin shell over its ViewModel.
 */
@Component({
  selector: 'app-heroes',
  imports: [
    NgIcon,
    RouterLink,
    HlmAvatar,
    HlmAvatarFallback,
    HlmBadge,
    HlmButton,
    HlmCardImports,
    HlmInput,
    HlmSelectImports,
    HlmTableImports,
  ],
  providers: [
    RosterViewModel,
    provideIcons({ lucidePencil, lucideSearch, lucideUserPlus }),
  ],
  template: `
    <div class="flex flex-col gap-6">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-bold">Roster</h1>
        <p class="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          Every hero on the books, strongest first.
          <hlm-badge variant="outline">Example data</hlm-badge>
        </p>
      </header>

      <div class="flex flex-wrap items-center gap-2" role="search">
        <div class="flex min-w-0 flex-1 items-center gap-2 text-muted-foreground sm:max-w-sm">
          <ng-icon name="lucideSearch" aria-hidden="true" />
          <input
            #search
            hlmInput
            type="search"
            placeholder="Search name or alias"
            aria-label="Search name or alias"
            [value]="vm.query()"
            (input)="vm.setQuery(search.value)"
          />
        </div>

        <hlm-select [value]="vm.classFilter()" (valueChange)="vm.setClassFilter($event)">
          <hlm-select-trigger class="w-40" aria-label="Class filter">
            <hlm-select-value />
          </hlm-select-trigger>
          <hlm-select-content *hlmSelectPortal>
            @for (option of vm.classOptions; track option.value) {
              <hlm-select-item [value]="option.value">{{ option.label }}</hlm-select-item>
            }
          </hlm-select-content>
        </hlm-select>

        <a hlmBtn routerLink="/recruit" class="ms-auto">
          <ng-icon name="lucideUserPlus" />
          Recruit
        </a>
      </div>

      <div hlmCard>
        <div hlmCardContent>
          <div hlmTableContainer>
            <table hlmTable>
              <caption hlmTableCaption class="sr-only">Heroes on the roster, strongest first</caption>
              <thead hlmTableHeader>
                <tr hlmTableRow>
                  <th hlmTableHead scope="col">Hero</th>
                  <th hlmTableHead scope="col">Class</th>
                  <th hlmTableHead scope="col" class="text-end">Power</th>
                  <th hlmTableHead scope="col">Status</th>
                  <th hlmTableHead scope="col">Clearance</th>
                  <th hlmTableHead scope="col"><span class="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody hlmTableBody>
                @for (row of vm.rows(); track row.hero.id) {
                  <tr hlmTableRow>
                    <td hlmTableCell>
                      <div class="flex items-center gap-3">
                        <hlm-avatar size="sm">
                          <span hlmAvatarFallback>{{ row.initials }}</span>
                        </hlm-avatar>
                        <div class="flex flex-col">
                          <a
                            [routerLink]="['/detail', row.hero.id]"
                            class="font-semibold text-foreground underline-offset-4 hover:underline"
                          >{{ row.hero.name }}</a>
                          <span class="text-xs text-muted-foreground">{{ row.hero.id }} · {{ row.hero.alias }}</span>
                        </div>
                      </div>
                    </td>
                    <td hlmTableCell>
                      <hlm-badge variant="outline">{{ row.hero.powerClass }}</hlm-badge>
                    </td>
                    <td hlmTableCell class="text-end tabular-nums">{{ row.hero.powerIndex }}</td>
                    <td hlmTableCell>
                      <hlm-badge [variant]="row.statusVariant">{{ row.hero.status }}</hlm-badge>
                    </td>
                    <td hlmTableCell>{{ row.hero.clearance }}</td>
                    <td hlmTableCell class="text-end">
                      <a
                        hlmBtn
                        variant="ghost"
                        size="icon"
                        [routerLink]="['/detail', row.hero.id]"
                        [attr.aria-label]="'Edit ' + row.hero.name"
                      >
                        <ng-icon name="lucidePencil" />
                      </a>
                    </td>
                  </tr>
                } @empty {
                  <tr hlmTableRow>
                    <td hlmTableCell colspan="6" class="text-center">
                      No heroes match these filters.
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        </div>

        <div hlmCardFooter class="flex flex-wrap items-center justify-between gap-2" role="status">
          <span>{{ vm.visibleCount() }} of {{ vm.total() }} heroes</span>
          <span>Sorted by power, highest first</span>
        </div>
      </div>
    </div>
  `,
})
export class Heroes {
  protected readonly vm = inject(RosterViewModel);
}
