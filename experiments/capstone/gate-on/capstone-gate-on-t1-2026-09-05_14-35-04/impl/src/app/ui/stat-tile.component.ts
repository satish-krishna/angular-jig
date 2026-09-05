import { Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import {
  lucideUserCheck,
  lucideActivity,
  lucideZap,
  lucideShieldAlert,
} from '@ng-icons/lucide';

@Component({
  selector: 'app-stat-tile',
  imports: [HlmCardImports, NgIconsModule],
  providers: [
    provideIcons({
      lucideUserCheck,
      lucideActivity,
      lucideZap,
      lucideShieldAlert,
    }),
  ],
  template: `
    <div hlmCard>
      <div hlmCardContent class="flex items-start justify-between gap-4">
        <div class="flex-1">
          <p class="text-sm text-muted-foreground">{{ label() }}</p>
          <p class="text-2xl sm:text-3xl font-bold mt-1 text-foreground">{{ value() }}</p>
        </div>
        <div class="flex-shrink-0">
          <ng-icon [name]="'lucide' + icon()"></ng-icon>
        </div>
      </div>
    </div>
  `,
})
export class StatTile {
  readonly label = input<string>('');
  readonly value = input<string>('');
  readonly icon = input<string>('');
}
