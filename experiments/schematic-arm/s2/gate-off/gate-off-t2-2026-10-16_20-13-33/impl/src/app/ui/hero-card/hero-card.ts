import { Component, computed, input, output } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import type { Hero } from '../../domain/hero.model';
import { initialsOf } from '../../domain/hero.presentation';
import { PowerMeter } from '../power-meter/power-meter';

/** One hero as a card. Presentational: the hero arrives as an input and the open action leaves as an output. */
@Component({
  selector: 'app-hero-card',
  imports: [HlmAvatarImports, HlmBadgeImports, HlmButtonImports, HlmCardImports, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly open = output<Hero>();

  /** Up to two initials from the hero's name, for the avatar fallback. */
  protected readonly initials = computed(() => initialsOf(this.hero().name));

  /** A missing hero is the one status the cards flag in the destructive colour. */
  protected readonly statusVariant = computed<'destructive' | 'secondary'>(() =>
    this.hero().status === 'MIA' ? 'destructive' : 'secondary',
  );
}
