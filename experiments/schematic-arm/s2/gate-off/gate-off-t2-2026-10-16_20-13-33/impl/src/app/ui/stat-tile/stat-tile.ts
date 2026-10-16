import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideTriangleAlert, lucideUserCheck, lucideZap } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';

/** One headline figure on the dashboard. Presentational: every value arrives through an input. */
@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmCardImports],
  providers: [provideIcons({ lucideActivity, lucideTriangleAlert, lucideUserCheck, lucideZap })],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  /** Lucide icon name for this tile. Registered above, so only the names listed there render. */
  readonly icon = input.required<string>();
  readonly detail = input('');
}
