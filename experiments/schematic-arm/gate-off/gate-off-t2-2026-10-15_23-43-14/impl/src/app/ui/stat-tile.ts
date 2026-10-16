import { Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

/**
 * A headline figure with a label and a note. Presentational: the icon is projected in
 * by the host, which registers it, so this component holds no icon registry of its own.
 */
@Component({
  selector: 'app-stat-tile',
  imports: [HlmCardImports],
  host: { class: 'block h-full' },
  template: `
    <div hlmCard class="h-full">
      <div hlmCardHeader class="flex flex-row items-center justify-between gap-2">
        <p hlmCardDescription>{{ label() }}</p>
        <span class="flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground" aria-hidden="true">
          <ng-content />
        </span>
      </div>
      <div hlmCardContent class="flex flex-col gap-1">
        <p hlmCardTitle emphasis="stat">{{ value() }}</p>
        <p hlmCardDescription>{{ note() }}</p>
      </div>
    </div>
  `,
})
export class StatTile {
  public readonly label = input.required<string>();
  public readonly value = input.required<number>();
  public readonly note = input<string>('');
}
