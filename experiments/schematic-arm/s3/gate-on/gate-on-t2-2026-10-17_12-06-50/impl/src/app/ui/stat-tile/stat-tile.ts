import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideShieldAlert, lucideUserCheck, lucideZap } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

export type StatIconName = 'lucideUserCheck' | 'lucideActivity' | 'lucideZap' | 'lucideShieldAlert';
export type StatTone = 'primary' | 'success' | 'warning' | 'muted';

// One headline figure on the dashboard. Presentational: the figures arrive as inputs.
@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmCardImports, HlmIconImports, HlmTypographyImports],
  providers: [provideIcons({ lucideUserCheck, lucideActivity, lucideZap, lucideShieldAlert })],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string>();
  readonly hint = input.required<string>();
  readonly icon = input.required<StatIconName>();
  readonly tone = input<StatTone>('muted');
}
