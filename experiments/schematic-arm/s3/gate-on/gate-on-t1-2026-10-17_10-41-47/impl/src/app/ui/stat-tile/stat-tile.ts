import { Component, input } from '@angular/core';
import { HlmCard, HlmCardContent } from '@spartan-ng/helm/card';
import { HlmH3, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';

// Presentational: label, value and hint come in as inputs. The icon is projected
// in by the screen, so the icon registration stays with the container that renders it.
@Component({
  selector: 'app-stat-tile',
  imports: [HlmCard, HlmCardContent, HlmH3, HlmMuted, HlmSmall],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>('');
}
