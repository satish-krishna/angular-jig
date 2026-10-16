import { Component, computed, input, output } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { heroInitials } from '../../domain/hero.initials';
import type { Hero } from '../../domain/hero.model';
import { PowerMeter } from '../power-meter/power-meter';

// Presentational: takes a hero and emits when the dossier is opened. No data service.
@Component({
  selector: 'app-hero-card',
  imports: [HlmCardImports, HlmAvatarImports, HlmBadgeImports, HlmButtonImports, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly open = output<Hero>();

  protected readonly initials = computed(() => heroInitials(this.hero().name));
}
