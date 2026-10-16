import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import {
  lucideActivity,
  lucideCheck,
  lucideTriangleAlert,
  lucideUserCheck,
  lucideZap,
} from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';

/** The icons a stat tile can show. Each one is registered on this component below. */
export type StatIcon =
  | 'lucideUserCheck'
  | 'lucideActivity'
  | 'lucideZap'
  | 'lucideTriangleAlert'
  | 'lucideCheck';

@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, ...HlmCardImports],
  providers: [
    provideIcons({ lucideUserCheck, lucideActivity, lucideZap, lucideTriangleAlert, lucideCheck }),
  ],
  templateUrl: './stat-tile.html',
  styleUrl: './stat-tile.css',
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<number>();
  readonly icon = input.required<StatIcon>();
}
