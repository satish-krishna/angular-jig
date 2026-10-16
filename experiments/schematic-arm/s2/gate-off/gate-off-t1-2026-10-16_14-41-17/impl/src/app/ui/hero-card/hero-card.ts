import { Component, computed, input, output } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import type { Hero } from '../../domain/hero';
import { initialsOf } from '../../domain/initials';
import { PowerMeter } from '../power-meter/power-meter';

/**
 * A hero's summary card. Emits the hero's id when the dossier is requested; the
 * caller decides where that goes. Presentational: it injects nothing.
 */
@Component({
  selector: 'app-hero-card',
  imports: [HlmCardImports, HlmAvatarImports, HlmBadgeImports, HlmButtonImports, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly open = output<string>();

  /** Two-letter portrait fallback from the hero's name, for example "SW" or "DI". */
  protected readonly initials = computed(() => initialsOf(this.hero().name));
}
