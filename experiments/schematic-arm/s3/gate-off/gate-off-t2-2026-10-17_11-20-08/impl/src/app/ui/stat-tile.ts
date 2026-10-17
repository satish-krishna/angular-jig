import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideCheck, lucideShieldAlert, lucideUserCheck, lucideZap } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

export type StatIcon = 'lucideActivity' | 'lucideCheck' | 'lucideShieldAlert' | 'lucideUserCheck' | 'lucideZap';

// One figure on the operations dashboard or a hero's detail. Inputs only; the icon names it may render are registered here.
@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmIconImports, HlmCardImports, HlmTypographyImports],
  providers: [provideIcons({ lucideActivity, lucideCheck, lucideShieldAlert, lucideUserCheck, lucideZap })],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly hint = input('');
  readonly icon = input.required<StatIcon>();
}
