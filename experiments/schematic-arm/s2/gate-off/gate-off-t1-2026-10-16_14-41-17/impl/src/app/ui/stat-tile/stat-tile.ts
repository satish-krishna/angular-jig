import { Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

/**
 * One headline number on the dashboard. The icon is projected by the caller, so the
 * caller registers the icon with provideIcons. Presentational: no data access.
 */
@Component({
  selector: 'app-stat-tile',
  imports: [HlmCardImports],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>('');
}
