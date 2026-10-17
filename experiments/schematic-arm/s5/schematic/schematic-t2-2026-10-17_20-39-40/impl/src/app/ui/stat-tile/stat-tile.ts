import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideCheck,
  lucideCrosshair,
  lucideShieldAlert,
  lucideTriangleAlert,
  lucideUserCheck,
  lucideZap,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmIconImports } from '@spartan-ng/helm/icon';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';

export type StatIcon =
  | 'lucideUserCheck'
  | 'lucideActivity'
  | 'lucideZap'
  | 'lucideTriangleAlert'
  | 'lucideCheck'
  | 'lucideCrosshair'
  | 'lucideShieldAlert';

// Presentational: every figure arrives as an input; no service is injected.
@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmCardImports, HlmIconImports, HlmTypographyImports],
  providers: [
    provideIcons({
      lucideActivity,
      lucideCheck,
      lucideCrosshair,
      lucideShieldAlert,
      lucideTriangleAlert,
      lucideUserCheck,
      lucideZap,
    }),
  ],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input.required<string>();
  readonly icon = input.required<StatIcon>();
  readonly tone = input<'default' | 'warning'>('default');
}
