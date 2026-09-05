import { Component, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgIconsModule } from '@ng-icons/core';
import { HlmCard, HlmCardContent } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-stat-tile',
  standalone: true,
  imports: [CommonModule, NgIconsModule, HlmCard, HlmCardContent],
  template: `
    <div hlmCard class="relative overflow-hidden">
      <div hlmCardContent class="p-6">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-sm font-medium text-muted-foreground">{{ label() }}</p>
            <p class="text-3xl font-bold text-foreground mt-2">{{ value() }}</p>
          </div>
          <div class="rounded-lg bg-primary/10 p-3">
            <ng-icon [name]="icon()" class="h-6 w-6 text-primary"></ng-icon>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class StatTile {
  label = input.required<string>();
  value = input.required<string | number>();
  icon = input.required<string>();
}
