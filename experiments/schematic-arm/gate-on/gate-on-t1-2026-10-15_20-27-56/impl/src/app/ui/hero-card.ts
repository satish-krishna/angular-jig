import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import type { Hero } from '../domain/hero.model';
import { HERO_STATUS_VARIANT, heroInitials } from './hero-presentation';
import { PowerMeter } from './power-meter';

/** One hero as a card. Presentational: takes the record as an input and injects nothing. */
@Component({
  selector: 'app-hero-card',
  imports: [RouterLink, HlmAvatarImports, HlmBadgeImports, HlmCardImports, PowerMeter],
  template: `
    <div hlmCard class="h-full">
      <div hlmCardHeader class="flex flex-row items-center gap-3">
        <hlm-avatar aria-hidden="true">
          <span hlmAvatarFallback>{{ initials() }}</span>
        </hlm-avatar>
        <div class="flex min-w-0 flex-col">
          <h3 hlmCardTitle class="truncate">
            <a class="rounded-sm underline-offset-4 hover:underline" [routerLink]="['/detail', hero().id]">{{ hero().name }}</a>
          </h3>
          <p hlmCardDescription class="truncate">{{ hero().alias }}</p>
        </div>
      </div>
      <div hlmCardContent class="flex flex-col gap-3">
        <div class="flex flex-wrap gap-1">
          <span hlmBadge variant="secondary">{{ hero().powerClass }}</span>
          <span hlmBadge [variant]="statusVariant()">{{ hero().status }}</span>
        </div>
        <app-power-meter [value]="hero().power" />
        <p class="text-xs text-muted-foreground">
          {{ hero().missions }} missions · {{ hero().successRate }}% success
        </p>
      </div>
    </div>
  `,
})
export class HeroCard {
  readonly hero = input.required<Hero>();

  protected readonly statusVariant = computed(() => HERO_STATUS_VARIANT[this.hero().status]);
  protected readonly initials = computed(() => heroInitials(this.hero().name));
}
