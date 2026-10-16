import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import type { RosterRow } from '../hero-presentation';

/**
 * The roster as a table, sorted and filtered by the caller. Presentational: the rows
 * come in, and each name and edit control links to that hero's dossier.
 */
@Component({
  selector: 'app-roster-table',
  imports: [
    RouterLink,
    NgIcon,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmTableImports,
    HlmTooltipImports,
  ],
  providers: [provideIcons({ lucidePencil })],
  templateUrl: './roster-table.html',
  styleUrl: './roster-table.css',
})
export class RosterTable {
  readonly rows = input.required<readonly RosterRow[]>();
  readonly emptyMessage = input('No heroes to show.');
}
