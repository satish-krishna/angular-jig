import { Component, input, output } from '@angular/core';
import type { Hero } from '../hero/hero.model';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';

@Component({
  selector: 'app-hero-card',
  imports: [HlmAvatarImports, HlmBadgeImports, HlmButtonImports, HlmCardImports],
  template: `
    <hlm-card>
      <hlm-card-header>
        <div class="flex items-start gap-3">
          <hlm-avatar>
            <span hlmAvatarFallback>{{ hero().name.substring(0, 2).toUpperCase() }}</span>
          </hlm-avatar>
          <div class="flex-1 min-w-0">
            <h3 hlmCardTitle>{{ hero().name }}</h3>
            <p hlmCardDescription>{{ hero().alias }}</p>
          </div>
        </div>
      </hlm-card-header>
      <div hlmCardContent>
        <div class="flex gap-2">
          <span hlmBadge variant="secondary">{{ hero().powerClass }}</span>
          <span hlmBadge [variant]="statusVariant(hero().status)">{{ hero().status }}</span>
        </div>
        <div class="text-sm text-muted-foreground mt-2">Power: {{ hero().power }}</div>
      </div>
      <hlm-card-footer>
        <button hlmBtn variant="ghost" size="sm" (click)="select.emit(hero())">View</button>
      </hlm-card-footer>
    </hlm-card>
  `,
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly select = output<Hero>();

  statusVariant(status: string): 'default' | 'secondary' | 'destructive' {
    return status === 'Active' ? 'default' : status === 'Injured' ? 'destructive' : 'secondary';
  }
}
