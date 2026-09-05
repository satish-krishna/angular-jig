import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import type { Hero } from '../domain/hero';

@Component({
  selector: 'app-hero-card',
  template: `
    <a [routerLink]="['/detail', hero().id]" class="block">
      <div hlm-card class="p-4 h-full hover:shadow-md transition-shadow flex flex-col gap-3">
        <div class="flex items-start gap-3">
          <div hlmAvatar>
            {{ getInitials() }}
          </div>
          <div class="flex-1 min-w-0">
            <h3 class="font-semibold text-sm truncate">{{ hero().name }}</h3>
            <p class="text-xs text-muted-foreground truncate">{{ hero().alias }}</p>
          </div>
        </div>

        <div class="flex flex-col gap-2">
          <div class="flex justify-between items-center">
            <span class="text-xs text-muted-foreground">Power</span>
            <span class="font-semibold">{{ hero().powerIndex }}</span>
          </div>

          <div class="flex gap-1">
            <div hlmBadge [variant]="getStatusVariant()">
              {{ hero().status }}
            </div>

            <div hlmBadge variant="outline">
              {{ hero().powerClass }}
            </div>
          </div>
        </div>

        <div class="border-t border-border pt-3 text-xs text-muted-foreground">
          <div class="flex justify-between">
            <span>{{ hero().missionCount }} missions</span>
            <span>{{ hero().successRate }}% success</span>
          </div>
        </div>
      </div>
    </a>
  `,
  standalone: true,
  imports: [RouterLink, HlmCardImports, HlmBadge, HlmAvatarImports],
})
export class HeroCard {
  readonly hero = input.required<Hero>();

  getInitials(): string {
    const parts = this.hero().name.split(' ');
    return parts.map((p) => p[0]).join('').toUpperCase();
  }

  getStatusVariant(): 'default' | 'secondary' | 'destructive' | 'outline' {
    switch (this.hero().status) {
      case 'Active':
        return 'default';
      case 'Injured':
        return 'secondary';
      case 'MIA':
        return 'destructive';
      case 'Reserve':
        return 'outline';
    }
  }
}
