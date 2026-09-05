import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { NgIcon } from '@ng-icons/core';
import {
  HlmCard,
  HlmCardContent,
} from '@spartan-ng/helm/card';
import { HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import type { Hero, HeroStatus } from '../domain/hero.model';

@Component({
  selector: 'app-hero-card',
  imports: [
    RouterLink,
    NgIcon,
    HlmCard,
    HlmCardContent,
    HlmAvatarFallback,
    HlmBadge,
  ],
  template: `
    <a hlmCard class="bg-card cursor-pointer hover:ring-2 hover:ring-primary transition-all" [routerLink]="['/detail', hero().id]">
      <div hlmCardContent class="flex flex-col gap-3 p-4">
        <div class="flex items-start gap-3">
          <div hlmAvatar>
            <div hlmAvatarFallback class="bg-primary text-primary-foreground font-bold">
              {{ hero().name.substring(0, 2).toUpperCase() }}
            </div>
          </div>
          <div class="flex flex-col flex-1 gap-1">
            <div class="font-bold text-foreground">{{ hero().name }}</div>
            <div class="text-xs text-muted-foreground">{{ hero().alias }}</div>
          </div>
        </div>
        <div class="flex gap-2">
          <div hlmBadge variant="outline" class="text-xs">{{ hero().powerClass }}</div>
          <div
            hlmBadge
            [variant]="statusVariant(hero().status)"
            class="text-xs"
          >
            {{ hero().status }}
          </div>
        </div>
        <div class="flex items-center gap-2">
          <ng-icon name="lucideZap" class="size-4 text-primary" />
          <span class="text-sm font-semibold text-foreground">{{ hero().powerIndex }}</span>
        </div>
      </div>
    </a>
  `,
})
export class HeroCard {
  hero = input.required<Hero>();

  statusVariant(status: HeroStatus): 'default' | 'secondary' | 'outline' {
    switch (status) {
      case 'Active':
        return 'default';
      case 'Injured':
        return 'secondary';
      case 'Reserve':
      case 'MIA':
        return 'outline';
    }
  }
}
