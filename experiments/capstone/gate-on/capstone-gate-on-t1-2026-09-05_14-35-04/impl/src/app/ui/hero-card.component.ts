import { Component, input } from '@angular/core';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { NgIconsModule, provideIcons } from '@ng-icons/core';
import { lucidePencil, lucideTrash2 } from '@ng-icons/lucide';
import type { Hero } from '../domain/hero.model';

@Component({
  selector: 'app-hero-card',
  imports: [
    HlmCardImports,
    HlmBadgeImports,
    HlmAvatarImports,
    NgIconsModule,
  ],
  providers: [
    provideIcons({
      lucidePencil,
      lucideTrash2,
    }),
  ],
  template: `
    <div hlmCard class="flex flex-col h-full">
      <div hlmCardContent class="flex flex-col gap-4">
        <div class="flex items-start gap-3">
          <hlm-avatar>
            <div hlmAvatarFallback>{{ hero().name.slice(0, 2).toUpperCase() }}</div>
          </hlm-avatar>
          <div class="flex-1 min-w-0">
            <p class="font-semibold text-foreground truncate">{{ hero().name }}</p>
            <p class="text-xs text-muted-foreground truncate">{{ hero().alias }}</p>
          </div>
        </div>
        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="text-sm text-muted-foreground">Power</span>
            <span class="text-lg font-bold text-primary">{{ hero().powerIndex }}</span>
          </div>
          <div class="flex gap-2">
            <hlm-badge variant="outline">{{ hero().powerClass }}</hlm-badge>
            <hlm-badge [variant]="statusVariant(hero().status)">
              {{ hero().status }}
            </hlm-badge>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class HeroCard {
  readonly hero = input.required<Hero>();

  statusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Injured':
        return 'secondary';
      case 'MIA':
      case 'Reserve':
        return 'outline';
      default:
        return 'default';
    }
  }
}
