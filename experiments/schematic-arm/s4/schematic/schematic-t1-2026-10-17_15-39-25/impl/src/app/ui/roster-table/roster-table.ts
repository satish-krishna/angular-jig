import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTooltipImports } from '@spartan-ng/helm/tooltip';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import type { RosterRow } from '../../domain/hero-display';

// Presentational: the roster as a table. Takes rows and a total and injects nothing.
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
  readonly total = input.required<number>();
}
