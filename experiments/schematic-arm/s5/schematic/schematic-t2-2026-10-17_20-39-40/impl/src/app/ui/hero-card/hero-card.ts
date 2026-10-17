import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import type { Hero } from '../../hero/hero.model';
import { HERO_STATUS_VARIANT, heroInitials } from '../../hero/hero-display';
import { PowerMeter } from '../power-meter/power-meter';

// Presentational: the hero arrives as an input; the card injects no data service.
@Component({
  selector: 'app-hero-card',
  imports: [
    RouterLink,
    HlmAvatarImports,
    HlmBadgeImports,
    HlmButtonImports,
    HlmCardImports,
    HlmTypographyImports,
    PowerMeter,
  ],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();

  protected readonly initials = computed(() => heroInitials(this.hero().name));

  protected readonly statusVariant = computed(() => HERO_STATUS_VARIANT[this.hero().status]);
}
