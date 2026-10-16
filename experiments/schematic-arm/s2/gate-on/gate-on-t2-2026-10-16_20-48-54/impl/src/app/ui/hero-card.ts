import { Component, computed, input } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import type { Hero } from '../domain/hero';
import { PowerMeter } from './power-meter';

@Component({
  selector: 'app-hero-card',
  imports: [...HlmAvatarImports, ...HlmBadgeImports, ...HlmCardImports, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();

  /** Up to two letters from the codename, for the avatar fallback. */
  protected readonly initials = computed(() =>
    this.hero()
      .name.split(/\s+/)
      .map((word) => word.charAt(0))
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase(),
  );
}
