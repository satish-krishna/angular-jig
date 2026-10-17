import { Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

// Presentational: the caller supplies the figures and projects the icon into the tile.
@Component({
  selector: 'app-stat-tile',
  imports: [HlmCardImports, HlmTypographyImports],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly hint = input.required<string>();
}
