import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmAvatar, HlmAvatarFallback } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmH4, HlmMuted } from '@spartan-ng/helm/typography';
import type { Hero } from '../../hero/hero.model';
import { heroPowerClassVariant, heroStatusVariant, monogramOf } from '../../hero/hero-presentation';
import { PowerMeter } from '../power-meter/power-meter';

@Component({
  selector: 'app-hero-card',
  imports: [
    RouterLink,
    HlmAvatar,
    HlmAvatarFallback,
    HlmBadge,
    HlmButton,
    HlmCardImports,
    HlmH4,
    HlmMuted,
    PowerMeter,
  ],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  public readonly hero = input.required<Hero>();

  protected readonly initials = computed(() => monogramOf(this.hero().name));
  protected readonly statusVariant = computed(() => heroStatusVariant(this.hero().status));
  protected readonly classVariant = computed(() => heroPowerClassVariant(this.hero().powerClass));
}
