import { Component, input } from '@angular/core';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';

/**
 * One headline figure. The icon is projected in by the screen, which registers it;
 * this component takes no data and injects nothing.
 */
@Component({
  selector: 'app-stat-tile',
  imports: [HlmCardImports, HlmBadgeImports],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number | null>();
  readonly hint = input<string>();
}
