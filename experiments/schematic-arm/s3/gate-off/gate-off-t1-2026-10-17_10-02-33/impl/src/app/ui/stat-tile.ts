import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideShieldAlert, lucideUserCheck, lucideZap } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

export type StatIcon = 'lucideUserCheck' | 'lucideActivity' | 'lucideZap' | 'lucideShieldAlert';

// Presentational: inputs only. It registers the icons it can render, because it is the component that renders them.
@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmCardImports, HlmIconImports, HlmTypographyImports],
  providers: [provideIcons({ lucideActivity, lucideShieldAlert, lucideUserCheck, lucideZap })],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly hint = input.required<string>();
  readonly icon = input.required<StatIcon>();
}
