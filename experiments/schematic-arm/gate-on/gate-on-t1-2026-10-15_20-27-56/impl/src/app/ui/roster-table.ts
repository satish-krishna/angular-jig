import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import type { RosterRow } from './hero-presentation';
import { RosterHeroCard } from './roster-hero-card';

/**
 * The roster as a table from the small-tablet breakpoint up, and as stacked cards below it.
 * Presentational: takes the rows as an input and injects nothing.
 */
@Component({
  selector: 'app-roster-table',
  imports: [
    RouterLink,
    NgIcon,
    ...HlmAvatarImports,
    ...HlmBadgeImports,
    ...HlmButtonImports,
    ...HlmTableImports,
    ...HlmTooltipImports,
    RosterHeroCard,
  ],
  providers: [provideIcons({ lucidePencil })],
  template: `
    <div class="hidden sm:block">
      <div hlmTableContainer>
        <table hlmTable aria-label="Hero roster">
          <thead hlmTHead>
            <tr hlmTr>
              <th hlmTh>Hero</th>
              <th hlmTh>Class</th>
              <th hlmTh>Power</th>
              <th hlmTh>Status</th>
              <th hlmTh class="hidden md:table-cell">Clearance</th>
              <th hlmTh><span class="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody hlmTBody>
            @for (row of rows(); track row.hero.id) {
              <tr hlmTr>
                <td hlmTd>
                  <div class="flex items-center gap-3">
                    <hlm-avatar aria-hidden="true">
                      <span hlmAvatarFallback>{{ row.initials }}</span>
                    </hlm-avatar>
                    <div class="flex min-w-0 flex-col">
                      <a class="font-medium underline-offset-4 hover:underline" [routerLink]="['/detail', row.hero.id]">{{ row.hero.name }}</a>
                      <span class="text-xs text-muted-foreground">{{ row.hero.id }}</span>
                    </div>
                  </div>
                </td>
                <td hlmTd><span hlmBadge variant="secondary">{{ row.hero.powerClass }}</span></td>
                <td hlmTd>{{ row.hero.power }}</td>
                <td hlmTd><span hlmBadge [variant]="row.statusVariant">{{ row.hero.status }}</span></td>
                <td hlmTd class="hidden md:table-cell">{{ row.hero.clearance }}</td>
                <td hlmTd>
                  <a
                    hlmBtn
                    variant="ghost"
                    size="icon"
                    hlmTooltip="Edit hero"
                    [attr.aria-label]="'Edit ' + row.hero.name"
                    [routerLink]="['/detail', row.hero.id]"
                  >
                    <ng-icon name="lucidePencil" />
                  </a>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex flex-col gap-3 sm:hidden">
      @for (row of rows(); track row.hero.id) {
        <app-roster-hero-card [hero]="row.hero" />
      }
    </div>
  `,
})
export class RosterTable {
  readonly rows = input.required<readonly RosterRow[]>();
}
