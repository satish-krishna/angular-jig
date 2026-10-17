import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import type { Hero } from '../../domain/hero';
import { initialsOf, statusVariantOf } from '../hero-display';
import { PowerMeter } from '../power-meter/power-meter';

// Presentational: one hero as a card. The hero comes in through input; the detail link is built here.
@Component({
  selector: 'app-hero-card',
  imports: [RouterLink, HlmAvatarImports, HlmBadgeImports, HlmCardImports, HlmTypographyImports, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();

  protected readonly initials = computed(() => initialsOf(this.hero().name));
  protected readonly statusVariant = computed(() => statusVariantOf(this.hero().status));
  protected readonly link = computed(() => ['/detail', this.hero().id]);
}
