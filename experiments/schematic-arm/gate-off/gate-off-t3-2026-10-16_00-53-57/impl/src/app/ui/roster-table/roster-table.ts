import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { initialsOf } from '../../domain/initials';
import type { Hero } from '../../domain/hero';
import { statusVariant } from '../hero-status-variant';

/**
 * The roster table, shared by the dashboard and the roster screen. Presentational: the rows
 * and footer come in as inputs, and it injects nothing. The table scrolls inside its own
 * container, so the page never scrolls sideways.
 */
@Component({
  selector: 'app-roster-table',
  imports: [RouterLink, NgIcon, HlmAvatarImports, HlmBadgeImports, HlmButtonImports, HlmTableImports, HlmTooltipImports],
  providers: [provideIcons({ lucidePencil })],
  template: `
    <div hlmTableContainer>
      <table hlmTable aria-label="Hero roster">
        <thead hlmTHead>
          <tr hlmTr>
            <th hlmTh scope="col">Hero</th>
            <th hlmTh scope="col">Class</th>
            <th hlmTh scope="col" class="text-end">Power</th>
            <th hlmTh scope="col">Status</th>
            <th hlmTh scope="col">Clearance</th>
            <th hlmTh scope="col"><span class="sr-only">Actions</span></th>
          </tr>
        </thead>
        <tbody hlmTBody>
          @if (heroes().length === 0) {
            <tr hlmTr>
              <td hlmTd colspan="6" class="text-center">{{ emptyMessage() }}</td>
            </tr>
          }
          @for (hero of heroes(); track hero.id) {
            <tr hlmTr>
              <td hlmTd>
                <div class="flex items-center gap-3">
                  <hlm-avatar size="sm" aria-hidden="true">
                    <span hlmAvatarFallback>{{ initialsOf(hero.name) }}</span>
                  </hlm-avatar>
                  <div class="min-w-0">
                    <a class="font-medium underline-offset-4 hover:underline" [routerLink]="['/detail', hero.id]">{{
                      hero.name
                    }}</a>
                    <p class="text-xs text-muted-foreground">{{ hero.id }} · {{ hero.alias }}</p>
                  </div>
                </div>
              </td>
              <td hlmTd>
                <span hlmBadge variant="secondary">{{ hero.powerClass }}</span>
              </td>
              <td hlmTd class="text-end tabular-nums">{{ hero.powerIndex }}</td>
              <td hlmTd>
                <span hlmBadge [variant]="statusVariant(hero.status)">{{ hero.status }}</span>
              </td>
              <td hlmTd>{{ hero.clearance }}</td>
              <td hlmTd>
                <a
                  hlmBtn
                  variant="ghost"
                  size="icon"
                  [routerLink]="['/detail', hero.id]"
                  [attr.aria-label]="'Edit ' + hero.name"
                  [hlmTooltip]="'Edit ' + hero.name"
                >
                  <ng-icon name="lucidePencil" aria-hidden="true" />
                </a>
              </td>
            </tr>
          }
        </tbody>
        @if (footer()) {
          <tfoot hlmTFoot>
            <tr hlmTr>
              <td hlmTd colspan="6">{{ footer() }}</td>
            </tr>
          </tfoot>
        }
      </table>
    </div>
  `,
})
export class RosterTable {
  readonly heroes = input.required<readonly Hero[]>();
  readonly footer = input<string>('');
  readonly emptyMessage = input<string>('No heroes to show.');

  protected readonly initialsOf = initialsOf;
  protected readonly statusVariant = statusVariant;
}
