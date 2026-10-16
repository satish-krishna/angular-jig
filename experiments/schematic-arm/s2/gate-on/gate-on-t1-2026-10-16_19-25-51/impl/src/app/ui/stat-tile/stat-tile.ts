import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideShieldAlert, lucideTarget, lucideTriangleAlert, lucideUserCheck, lucideZap } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';

/** The icons a stat tile can show. Each is registered on the tile below. */
export type StatTileIcon =
  | 'lucideUserCheck'
  | 'lucideActivity'
  | 'lucideZap'
  | 'lucideShieldAlert'
  | 'lucideTarget'
  | 'lucideTriangleAlert';

@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmCardImports],
  providers: [
    provideIcons({ lucideUserCheck, lucideActivity, lucideZap, lucideShieldAlert, lucideTarget, lucideTriangleAlert }),
  ],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input('');
  readonly icon = input.required<StatTileIcon>();
}
