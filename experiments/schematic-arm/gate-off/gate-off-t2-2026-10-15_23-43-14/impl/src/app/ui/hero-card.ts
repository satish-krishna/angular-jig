import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import type { Hero } from '../domain/hero';
import { PowerMeter } from './power-meter';
import { STATUS_VARIANT, heroInitials } from './hero-presentation';

/**
 * One hero as a card on the dashboard. Presentational: the hero arrives as an input and
 * the name links to the dossier. Injects nothing but the router link directive.
 */
@Component({
  selector: 'app-hero-card',
  imports: [RouterLink, HlmAvatar, HlmAvatarFallback, HlmBadge, HlmCardImports, PowerMeter],
  host: { class: 'block h-full' },
  template: `
    <div hlmCard class="h-full">
      <div hlmCardHeader class="flex flex-row items-center gap-3">
        <hlm-avatar>
          <span hlmAvatarFallback>{{ initials() }}</span>
        </hlm-avatar>
        <div class="flex min-w-0 flex-col">
          <a [routerLink]="['/detail', hero().id]" class="truncate font-semibold text-foreground underline-offset-4 hover:underline">{{ hero().name }}</a>
          <span class="truncate text-xs text-muted-foreground">{{ hero().id }} · {{ hero().alias }}</span>
        </div>
      </div>

      <div hlmCardContent class="flex flex-col gap-4">
        <div class="flex flex-wrap gap-2">
          <hlm-badge variant="outline">{{ hero().powerClass }}</hlm-badge>
          <hlm-badge [variant]="statusVariant()">{{ hero().status }}</hlm-badge>
        </div>
        <app-power-meter [value]="hero().powerIndex" />
      </div>

      <div hlmCardFooter>
        <p class="text-xs text-muted-foreground">
          {{ hero().missionCount }} missions · {{ hero().successRate }}% success · {{ hero().clearance }}
        </p>
      </div>
    </div>
  `,
})
export class HeroCard {
  public readonly hero = input.required<Hero>();

  protected readonly statusVariant = computed(() => STATUS_VARIANT[this.hero().status]);

  protected readonly initials = computed(() => heroInitials(this.hero().name));
}
