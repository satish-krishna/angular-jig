import { Component, input, output } from '@angular/core';
import type { Hero } from '../hero/hero.model';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';

@Component({
  selector: 'app-hero-card',
  imports: [HlmAvatarImports, HlmBadgeImports, HlmButtonImports],
  template: `
    <div class="rounded-lg border border-border bg-card p-4">
      <div class="flex items-start gap-3">
        <hlm-avatar>
          <span hlmAvatarFallback>{{ hero().name.substring(0, 2).toUpperCase() }}</span>
        </hlm-avatar>
        <div class="flex-1 min-w-0">
          <p class="font-semibold text-foreground">{{ hero().name }}</p>
          <p class="text-sm text-muted-foreground">{{ hero().alias }}</p>
          <div class="mt-2 flex gap-2">
            <span hlmBadge variant="secondary">{{ hero().powerClass }}</span>
            <span hlmBadge [variant]="statusVariant(hero().status)">{{ hero().status }}</span>
          </div>
        </div>
      </div>
      <div class="mt-3 flex items-center justify-between text-sm">
        <span class="text-muted-foreground">Power: {{ hero().power }}</span>
        <button hlmBtn variant="ghost" size="sm" (click)="select.emit(hero())">View</button>
      </div>
    </div>
  `,
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly select = output<Hero>();

  statusVariant(status: string): 'default' | 'secondary' | 'destructive' {
    return status === 'Active' ? 'default' : status === 'Injured' ? 'destructive' : 'secondary';
  }
}
