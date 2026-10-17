import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideShieldAlert, lucideUserCheck, lucideZap } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';

export type StatIcon = 'lucideUserCheck' | 'lucideActivity' | 'lucideZap' | 'lucideShieldAlert';

// Presentational: the figure comes in through inputs and it injects nothing.
@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmIconImports, HlmCardImports],
  providers: [provideIcons({ lucideUserCheck, lucideActivity, lucideZap, lucideShieldAlert })],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly detail = input.required<string>();
  readonly icon = input.required<StatIcon>();
}
