import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideTriangleAlert, lucideUserCheck, lucideZap } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';

export type StatTone = 'info' | 'success' | 'warning' | 'neutral';

// Presentational: inputs only, no data service.
@Component({
  selector: 'app-stat-tile',
  imports: [HlmCardImports, NgIcon],
  providers: [provideIcons({ lucideActivity, lucideTriangleAlert, lucideUserCheck, lucideZap })],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
  readonly tone = input<StatTone>('neutral');
}
