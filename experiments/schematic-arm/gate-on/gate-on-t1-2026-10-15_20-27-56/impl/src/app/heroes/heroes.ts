import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideUserPlus } from '@ng-icons/lucide';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmFieldImports } from '@spartan-ng/helm/field';
import { HlmInputImports } from '@spartan-ng/helm/input';
import { HlmSelectImports } from '@spartan-ng/helm/select';
import { RosterTable } from '../ui/roster-table';
import { HeroesViewModel } from './heroes.view-model';

@Component({
  selector: 'app-heroes',
  imports: [
    RouterLink,
    NgIcon,
    ...HlmButtonImports,
    ...HlmFieldImports,
    ...HlmInputImports,
    ...HlmSelectImports,
    RosterTable,
  ],
  providers: [HeroesViewModel, provideIcons({ lucideUserPlus })],
  template: `
    <section class="flex flex-col gap-6">
      <header class="flex flex-col gap-1">
        <h1 class="text-2xl font-semibold">Roster</h1>
        <p class="text-sm text-muted-foreground">Example data. Every hero and figure here is invented for the demo.</p>
      </header>

      <div class="flex flex-wrap items-end gap-3">
        <hlm-field class="w-full sm:w-72">
          <input
            #search
            hlmInput
            id="roster-search"
            type="search"
            aria-label="Search heroes"
            placeholder="Search name, alias or ID"
            [value]="vm.query()"
            (input)="vm.setQuery(search.value)"
          />
        </hlm-field>

        <hlm-field class="w-full sm:w-44">
          <label hlmFieldLabel for="roster-class-filter">Class</label>
          <hlm-select [value]="vm.classFilter()" (valueChange)="vm.setClassFilter($event)">
            <hlm-select-trigger buttonId="roster-class-filter" class="w-full">
              <hlm-select-value placeholder="All classes" />
            </hlm-select-trigger>
            <hlm-select-content *hlmSelectPortal>
              @for (option of vm.classOptions; track option) {
                <hlm-select-item [value]="option">{{ option }}</hlm-select-item>
              }
            </hlm-select-content>
          </hlm-select>
        </hlm-field>

        <a hlmBtn class="ms-auto" routerLink="/recruit">
          <ng-icon name="lucideUserPlus" />
          Recruit
        </a>
      </div>

      @if (vm.visibleCount() === 0) {
        <p class="text-sm text-muted-foreground">No heroes match these filters.</p>
      }

      <app-roster-table [rows]="vm.rows()" />

      <footer class="flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <p>{{ vm.visibleCount() }} of {{ vm.totalCount() }} heroes</p>
        <p>Sorted by power</p>
      </footer>
    </section>
  `,
})
export class Heroes {
  protected readonly vm = inject(HeroesViewModel);
}
