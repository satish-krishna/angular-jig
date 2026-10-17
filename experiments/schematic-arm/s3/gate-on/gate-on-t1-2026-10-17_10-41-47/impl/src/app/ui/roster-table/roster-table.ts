import { Component, input, output } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmIcon } from '@spartan-ng/helm/icon';
import { HlmTable, HlmTableContainer, HlmTBody, HlmTd, HlmTh, HlmTHead, HlmTr } from '@spartan-ng/helm/table';
import { HlmTooltip } from '@spartan-ng/helm/tooltip';
import { HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import { heroInitials, STATUS_VARIANT } from '../../domain/hero-presentation';
import type { Hero } from '../../domain/hero.model';

// Presentational: the rows come in as an input, the edit request goes out as an output.
// The wide table scrolls inside its own container, so the page itself never scrolls sideways.
@Component({
  selector: 'app-roster-table',
  imports: [NgIcon, HlmIcon, HlmAvatarImports, HlmBadge, HlmButton, HlmTable, HlmTableContainer, HlmTBody, HlmTd, HlmTh, HlmTHead, HlmTr, HlmTooltip, HlmMuted, HlmSmall],
  providers: [provideIcons({ lucidePencil })],
  templateUrl: './roster-table.html',
  styleUrl: './roster-table.css',
})
export class RosterTable {
  readonly rows = input.required<readonly Hero[]>();
  /** Shown in the table body when there are no rows. */
  readonly emptyText = input('No heroes on the roster.');
  readonly edit = output<Hero>();

  protected readonly statusVariant = STATUS_VARIANT;

  protected initialsOf(hero: Hero): string {
    return heroInitials(hero.name);
  }
}
