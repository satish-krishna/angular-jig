import { Component, computed, input } from '@angular/core';
import { NgIcon, provideIcons } from '@ng-icons/core';
import { lucidePencil } from '@ng-icons/lucide';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import type { Hero } from '../domain/hero.model';
import { HERO_STATUS_VARIANT, heroInitials } from './hero-presentation';
import { PowerMeter } from './power-meter';

/** One roster entry as a card, used below the table breakpoint. Presentational: takes the record, injects nothing. */
@Component({
  selector: 'app-roster-hero-card',
  imports: [RouterLink, NgIcon, HlmAvatarImports, HlmBadgeImports, HlmButtonImports, HlmCardImports, PowerMeter],
  providers: [provideIcons({ lucidePencil })],
  template: `
    <div hlmCard>
      <div hlmCardHeader class="flex flex-row items-center gap-3">
        <hlm-avatar aria-hidden="true">
          <span hlmAvatarFallback>{{ initials() }}</span>
        </hlm-avatar>
        <div class="flex min-w-0 flex-1 flex-col">
          <h2 hlmCardTitle class="truncate">
            <a class="rounded-sm underline-offset-4 hover:underline" [routerLink]="['/detail', hero().id]">{{ hero().name }}</a>
          </h2>
          <p hlmCardDescription class="truncate">{{ hero().id }} · {{ hero().alias }}</p>
        </div>
        <a
          hlmBtn
          variant="ghost"
          size="icon"
          [attr.aria-label]="'Edit ' + hero().name"
          [routerLink]="['/detail', hero().id]"
        >
          <ng-icon name="lucidePencil" />
        </a>
      </div>
      <div hlmCardContent class="flex flex-col gap-3">
        <div class="flex flex-wrap gap-1">
          <span hlmBadge variant="secondary">{{ hero().powerClass }}</span>
          <span hlmBadge [variant]="statusVariant()">{{ hero().status }}</span>
          <span hlmBadge variant="outline">{{ hero().clearance }}</span>
        </div>
        <app-power-meter [value]="hero().power" />
        <p class="text-xs text-muted-foreground">
          {{ hero().missions }} missions · {{ hero().successRate }}% success
        </p>
      </div>
    </div>
  `,
})
export class RosterHeroCard {
  readonly hero = input.required<Hero>();

  protected readonly initials = computed(() => heroInitials(this.hero().name));
  protected readonly statusVariant = computed(() => HERO_STATUS_VARIANT[this.hero().status]);
}
