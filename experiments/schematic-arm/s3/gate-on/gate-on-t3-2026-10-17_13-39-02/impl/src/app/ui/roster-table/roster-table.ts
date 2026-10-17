import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTableImports } from '@spartan-ng/helm/table';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import type { RosterRow } from '../hero-display';

// Presentational: the roster as a table. Rows come in through input; each row links to its hero's detail screen.
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
    HlmTypographyImports,
  ],
  providers: [provideIcons({ lucidePencil })],
  templateUrl: './roster-table.html',
  styleUrl: './roster-table.css',
})
export class RosterTable {
  readonly rows = input.required<readonly RosterRow[]>();
}
