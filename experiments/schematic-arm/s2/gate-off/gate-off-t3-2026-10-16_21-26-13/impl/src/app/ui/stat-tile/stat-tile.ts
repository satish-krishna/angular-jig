import { Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

/**
 * A headline number on a card. The icon is projected in by the host, so the host
 * registers the icon it renders and this component stays icon-agnostic.
 */
@Component({
  selector: 'app-stat-tile',
  imports: [HlmCardImports],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly detail = input.required<string>();
}
