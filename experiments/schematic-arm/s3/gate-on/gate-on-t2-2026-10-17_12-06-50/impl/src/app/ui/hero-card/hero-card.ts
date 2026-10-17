import { Component, computed, input, output } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import type { Hero } from '../../domain/hero.model';
import { heroInitials, STATUS_VARIANT } from '../../domain/hero.presentation';
import { PowerMeter } from '../power-meter/power-meter';

// A hero in a card. Presentational: the hero arrives as an input, and a click is reported upward.
@Component({
  selector: 'app-hero-card',
  imports: [HlmAvatarImports, HlmBadgeImports, HlmButtonImports, HlmCardImports, HlmTypographyImports, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly selected = output<Hero>();

  protected readonly statusVariant = computed(() => STATUS_VARIANT[this.hero().status]);

  // Two letters from the first two words of the name: "Dr. Ion" reads as "DI".
  protected readonly initials = computed(() => heroInitials(this.hero().name));
}
