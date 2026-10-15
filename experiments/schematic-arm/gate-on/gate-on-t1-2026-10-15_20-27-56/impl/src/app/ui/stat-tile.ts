import { Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

/**
 * A headline number with a label. The icon is projected by the host through `[statIcon]`,
 * so this component registers no icons and injects nothing.
 */
@Component({
  selector: 'app-stat-tile',
  imports: [HlmCardImports],
  template: `
    <div hlmCard class="h-full">
      <div hlmCardHeader class="flex flex-row items-start justify-between gap-2">
        <p hlmCardDescription>{{ label() }}</p>
        <ng-content select="[statIcon]" />
      </div>
      <div hlmCardContent class="flex flex-col gap-1">
        <p hlmCardTitle emphasis="stat">{{ value() }}</p>
        <p hlmCardDescription>{{ hint() }}</p>
      </div>
    </div>
  `,
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly hint = input<string>('');
}
