import { Component, input } from '@angular/core';
import { NgIcon } from '@ng-icons/core';
import { HlmCardImports } from '@spartan-ng/helm/card';

export type StatIconName = 'lucideUserCheck' | 'lucideActivity' | 'lucideZap' | 'lucideShieldAlert';

@Component({
  selector: 'app-stat-tile',
  template: `
    <div hlm-card class="p-6">
      <div class="flex items-start justify-between gap-4">
        <div class="flex-1 flex flex-col gap-1">
          <p class="text-sm text-muted-foreground">{{ label() }}</p>
          <p class="text-3xl font-bold">{{ value() }}</p>
        </div>
        <div class="text-muted-foreground">
          <ng-icon [name]="icon()" class="w-6 h-6" />
        </div>
      </div>
    </div>
  `,
  standalone: true,
  imports: [NgIcon, HlmCardImports],
})
export class StatTile {
  readonly label = input.required<string>();
  readonly value = input.required<string | number>();
  readonly icon = input.required<StatIconName>();
}
