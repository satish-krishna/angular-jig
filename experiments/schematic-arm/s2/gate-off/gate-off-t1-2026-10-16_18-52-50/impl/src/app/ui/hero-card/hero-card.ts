import { Component, computed, input, output } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import type { Hero } from '../../domain/hero.model';
import { initialsOf } from '../../domain/hero.presentation';
import { PowerMeter } from '../power-meter/power-meter';

/** A hero portrait card. Presentational: the hero comes in, the dossier request goes out. */
@Component({
  selector: 'app-hero-card',
  imports: [HlmAvatarImports, HlmBadgeImports, HlmButtonImports, HlmCardImports, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly dossierRequested = output<Hero>();

  protected readonly initials = computed(() => initialsOf(this.hero().name));
}
