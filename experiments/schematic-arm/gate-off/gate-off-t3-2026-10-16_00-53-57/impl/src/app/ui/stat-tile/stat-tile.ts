import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

/**
 * One figure on the dashboard. Presentational: the icon is looked up by name, so the
 * owning screen registers it with provideIcons. Injects nothing.
 */
@Component({
  selector: 'app-stat-tile',
  imports: [HlmCardImports, NgIcon],
  template: `
    <hlm-card>
      <hlm-card-header>
        <p hlmCardDescription>{{ label() }}</p>
        <p class="text-2xl font-semibold tabular-nums">{{ value() }}</p>
      </hlm-card-header>
      <div hlmCardAction>
        <ng-icon [name]="icon()" class="size-5 text-muted-foreground" aria-hidden="true" />
      </div>
    </hlm-card>
  `,
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<number | string>();
  readonly icon = input.required<string>();
}
