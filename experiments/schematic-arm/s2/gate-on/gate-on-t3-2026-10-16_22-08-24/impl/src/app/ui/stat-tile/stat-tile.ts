import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCheck, lucideShieldAlert, lucideTarget, lucideUserCheck, lucideZap } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';

/** The icons a stat tile can show. Each one is registered below, so every name renders. */
export type StatTileIcon =
  | 'lucideUserCheck'
  | 'lucideActivity'
  | 'lucideZap'
  | 'lucideShieldAlert'
  | 'lucideTarget'
  | 'lucideCheck';

@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmCardImports],
  providers: [provideIcons({ lucideUserCheck, lucideActivity, lucideZap, lucideShieldAlert, lucideTarget, lucideCheck })],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input<string>('');
  readonly icon = input.required<StatTileIcon>();
}
