import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import type { Hero } from '../../domain/hero.model';
import { PowerMeter } from '../power-meter/power-meter';
import { heroInitials, heroStatusVariant } from '../hero-presentation';

/** One hero as a summary card. Links to the hero's detail screen by id. */
@Component({
  selector: 'app-hero-card',
  imports: [RouterLink, HlmAvatarImports, HlmBadgeImports, HlmCardImports, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();

  protected readonly initials = computed(() => heroInitials(this.hero().name));
  protected readonly statusVariant = computed(() => heroStatusVariant(this.hero().status));
}
