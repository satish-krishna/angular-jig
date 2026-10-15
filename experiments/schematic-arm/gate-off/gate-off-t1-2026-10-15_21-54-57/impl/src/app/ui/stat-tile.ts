import { Component, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucideActivity, lucideShieldAlert, lucideUserCheck, lucideZap } from '@ng-icons/lucide';
import { HlmCardImports } from '@spartan-ng/helm/card';

export type StatIcon = 'lucideUserCheck' | 'lucideActivity' | 'lucideZap' | 'lucideShieldAlert';

/** The figures a stat tile shows. The dashboard view-model builds these; the tile renders them. */
export interface StatFigure {
  readonly label: string;
  readonly value: string | number;
  readonly hint: string;
  readonly icon: StatIcon;
}

/** One headline figure on the operations dashboard. Presentational: the caller supplies every value. */
@Component({
  selector: 'app-stat-tile',
  imports: [HlmCardImports, NgIcon],
  providers: [provideIcons({ lucideUserCheck, lucideActivity, lucideZap, lucideShieldAlert })],
  template: `
    <div hlmCard>
      <div hlmCardContent class="flex items-start justify-between gap-3">
        <div class="flex min-w-0 flex-col gap-1">
          <p class="text-sm text-muted-foreground">{{ label() }}</p>
          <p class="text-2xl font-semibold tabular-nums">{{ value() }}</p>
          <p class="text-xs text-muted-foreground">{{ hint() }}</p>
        </div>
        <ng-icon [name]="icon()" class="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
      </div>
    </div>
  `,
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input.required<string>();
  readonly icon = input.required<StatIcon>();
}
