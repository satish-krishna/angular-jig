import { Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmMuted } from '@spartan-ng/helm/typography';

// Presentational: one headline figure. The screen projects the icon in, so this component
// registers no icon and injects nothing.
@Component({
  selector: 'app-stat-tile',
  imports: [HlmCardImports, HlmMuted],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly hint = input<string>('');
}
