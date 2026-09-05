import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import {
  HlmCard,
  HlmCardContent,
} from '@spartan-ng/helm/card';

@Component({
  selector: 'app-stat-tile',
  imports: [NgIcon, HlmCard, HlmCardContent],
  template: `
    <div hlmCard class="bg-card">
      <div hlmCardContent class="flex flex-col gap-2 p-4">
        <div class="flex items-center justify-between">
          <span class="text-sm font-medium text-muted-foreground">{{ label() }}</span>
          <ng-icon [name]="icon()" class="size-5 text-primary" />
        </div>
        <div class="text-3xl font-bold text-foreground">{{ value() }}</div>
      </div>
    </div>
  `,
})
export class StatTile {
  label = input.required<string>();
  value = input.required<string | number>();
  icon = input.required<string>();
}
