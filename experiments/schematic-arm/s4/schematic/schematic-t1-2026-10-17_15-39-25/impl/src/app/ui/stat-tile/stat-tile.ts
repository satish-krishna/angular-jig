import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideShieldAlert, lucideUserCheck, lucideZap } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import { Component, input } from '@angular/core';

export type StatIcon = 'lucideUserCheck' | 'lucideActivity' | 'lucideZap' | 'lucideShieldAlert';

// Presentational: a figure and its caption. Injects nothing; the ViewModel supplies the numbers.
@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmIconImports, HlmCardImports, HlmTypographyImports],
  providers: [provideIcons({ lucideActivity, lucideShieldAlert, lucideUserCheck, lucideZap })],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly hint = input<string>('');
  readonly icon = input.required<StatIcon>();
}
