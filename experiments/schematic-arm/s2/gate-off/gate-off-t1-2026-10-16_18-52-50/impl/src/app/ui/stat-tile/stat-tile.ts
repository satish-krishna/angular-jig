import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideShieldAlert, lucideUserCheck, lucideZap } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';

/** The icons a stat tile can show. Each one is registered below so `name` resolves. */
export type StatIcon = 'lucideUserCheck' | 'lucideActivity' | 'lucideZap' | 'lucideShieldAlert';

/** The data one stat tile shows. Screens build these; the tile only renders them. */
export interface StatFigure {
  readonly label: string;
  readonly value: string;
  readonly detail: string;
  readonly icon: StatIcon;
}

/** One headline figure. Presentational: everything arrives through inputs. */
@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmCardImports],
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
