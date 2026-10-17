import { Component, computed, input, output } from '@angular/core';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import type { Hero } from '../../domain/hero.model';
import { initialsOf, STATUS_VARIANT } from '../hero-display';
import { PowerMeter } from '../power-meter/power-meter';

// Presentational: the hero comes in through an input and a selection goes out through
// an output. The screen decides what selecting a hero does. It injects nothing.
@Component({
  selector: 'app-hero-card',
  imports: [HlmCardImports, HlmAvatarImports, HlmBadge, HlmButton, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly open = output<string>();

  protected readonly initials = computed(() => initialsOf(this.hero().name));

  protected readonly statusVariant = computed(() => STATUS_VARIANT[this.hero().status]);
}
