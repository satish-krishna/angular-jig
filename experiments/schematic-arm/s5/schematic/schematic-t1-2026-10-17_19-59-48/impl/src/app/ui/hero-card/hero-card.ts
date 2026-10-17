import { Component, computed, input } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmH3, HlmMuted, HlmSmall } from '@spartan-ng/helm/typography';
import type { Hero } from '../../hero/hero.model';
import { STATUS_BADGE } from '../../hero/hero-presentation';
import { PowerMeter } from '../power-meter/power-meter';

// Presentational: one hero as a card. The screen decides what a click does; this only shows.
@Component({
  selector: 'app-hero-card',
  imports: [HlmAvatarImports, HlmBadgeImports, HlmCardImports, HlmH3, HlmMuted, HlmSmall, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();

  protected readonly initials = computed(() => this.hero().name.slice(0, 2).toUpperCase());
  protected readonly statusVariant = computed(() => STATUS_BADGE[this.hero().status]);
}
