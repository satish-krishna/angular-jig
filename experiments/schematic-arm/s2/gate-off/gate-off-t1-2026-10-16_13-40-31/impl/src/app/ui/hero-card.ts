import { Component, computed, input } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import type { Hero } from '../domain/hero.model';
import { PowerMeter } from './power-meter';

/** One hero as a card. Presentational: the hero arrives as an input and nothing is fetched here. */
@Component({
  selector: 'app-hero-card',
  imports: [HlmCardImports, HlmBadgeImports, HlmAvatarImports, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();

  /** Up to two initials from the hero's name, for the avatar fallback. */
  protected readonly initials = computed(() =>
    this.hero()
      .name.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join(''),
  );
}
