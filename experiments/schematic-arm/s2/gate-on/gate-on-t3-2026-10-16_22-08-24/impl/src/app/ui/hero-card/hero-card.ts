import { PercentPipe } from '@angular/common';
import { Component, computed, input, output } from '@angular/core';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import type { Hero } from '../../domain/hero.model';
import { initialsOf, STATUS_BADGE } from '../hero-badges';
import { PowerMeter } from '../power-meter/power-meter';

@Component({
  selector: 'app-hero-card',
  imports: [PercentPipe, HlmCardImports, HlmBadge, HlmButton, HlmAvatar, HlmAvatarFallback, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly opened = output<Hero>();

  protected readonly initials = computed(() => initialsOf(this.hero().alias));
  protected readonly statusVariant = computed(() => STATUS_BADGE[this.hero().status]);
}
