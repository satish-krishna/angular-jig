import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import type { Hero } from '../domain/hero.model';
import { STATUS_VARIANT, initialsOf, type StatusVariant } from './hero-status';

export interface RosterRow {
  readonly hero: Hero;
  readonly initials: string;
  readonly statusVariant: StatusVariant;
}

export function rosterRow(hero: Hero): RosterRow {
  return { hero, initials: initialsOf(hero.name), statusVariant: STATUS_VARIANT[hero.status] };
}

// Presentational: the roster table. It takes rows as an input and injects no data service.
// It sits in a scroll container so the table scrolls inside itself, never the page.
@Component({
  selector: 'app-roster-table',
  imports: [
    RouterLink,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmIconImports,
    HlmTableImports,
    HlmTooltipImports,
    HlmTypographyImports,
  ],
  providers: [provideIcons({ lucidePencil })],
  templateUrl: './roster-table.html',
  styleUrl: './roster-table.css',
})
export class RosterTable {
  readonly rows = input.required<readonly RosterRow[]>();
}
