import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import type { Hero } from '../domain/hero.model';
import { PowerMeter } from './power-meter';
import { STATUS_VARIANT, initialsOf } from './hero-status';

// Presentational: takes one hero as an input and routes to its detail screen. Injects no data service.
@Component({
  selector: 'app-hero-card',
  imports: [RouterLink, HlmAvatarImports, HlmBadgeImports, HlmCardImports, HlmTypographyImports, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();

  protected readonly initials = computed(() => initialsOf(this.hero().name));
  protected readonly statusVariant = computed(() => STATUS_VARIANT[this.hero().status]);
}
