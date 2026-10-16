import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmLabelImports } from '@spartan-ng/helm/label';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { RosterTable } from '../ui/roster-table/roster-table';
import { RosterViewModel } from './roster.view-model';

/** The roster screen: filter bar and roster table. All state lives in RosterViewModel. */
@Component({
  selector: 'app-heroes',
  imports: [RouterLink, NgIcon, HlmButtonImports, HlmInputImports, HlmLabelImports, HlmSelectImports, RosterTable],
  providers: [RosterViewModel, provideIcons({ lucideUserPlus })],
  template: `
    <div class="flex flex-col gap-6">
      <header class="min-w-0">
        <h1 class="text-2xl font-semibold">Roster</h1>
        <p class="text-sm text-muted-foreground">Example data, for demonstration only.</p>
      </header>

      <div class="flex flex-wrap items-center gap-3">
        <input
          hlmInput
          #search
          type="search"
          class="w-full sm:w-64"
          placeholder="Search name, alias or ID"
          aria-label="Search heroes"
          [value]="vm.query()"
          (input)="vm.setQuery(search.value)"
        />

        <label hlmLabel for="roster-class-filter" class="sr-only">Filter by class</label>
        <hlm-select
          class="w-full sm:w-48"
          [value]="vm.classFilter()"
          [itemToString]="vm.labelFor"
          (valueChange)="vm.setClassFilter($event)"
        >
          <hlm-select-trigger class="w-full" buttonId="roster-class-filter">
            <hlm-select-value placeholder="All classes" />
          </hlm-select-trigger>
          <hlm-select-content *hlmSelectPortal>
            @for (option of vm.classOptions; track option) {
              <hlm-select-item [value]="option">{{ vm.labelFor(option) }}</hlm-select-item>
            }
          </hlm-select-content>
        </hlm-select>

        <a hlmBtn routerLink="/recruit" class="ms-auto">
          <ng-icon name="lucideUserPlus" aria-hidden="true" />
          Recruit
        </a>
      </div>

      <app-roster-table
        [heroes]="vm.rows()"
        [footer]="vm.summary()"
        emptyMessage="No heroes match these filters."
      />
    </div>
  `,
})
export class Heroes {
  protected readonly vm = inject(RosterViewModel);
}
