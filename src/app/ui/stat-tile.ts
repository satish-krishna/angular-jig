import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';

@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon],
  template: `
    <div class="flex items-start justify-between rounded-lg border border-border bg-card p-6">
      <div>
        <p class="text-sm text-muted-foreground">{{ label() }}</p>
        <p class="mt-2 text-3xl font-bold text-foreground">{{ value() }}</p>
      </div>
      <ng-icon [name]="icon()" class="size-8 text-muted-foreground" />
    </div>
  `,
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<string>();
}
