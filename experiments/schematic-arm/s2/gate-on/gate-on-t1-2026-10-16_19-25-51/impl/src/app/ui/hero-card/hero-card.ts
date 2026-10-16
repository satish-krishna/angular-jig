import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import type { Hero } from '../../domain/hero.model';
import { PowerMeter } from '../power-meter/power-meter';
import { StatusBadge } from '../status-badge/status-badge';

@Component({
  selector: 'app-hero-card',
  imports: [RouterLink, HlmAvatarImports, HlmBadgeImports, HlmCardImports, PowerMeter, StatusBadge],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();

  /** Up to two letters from the hero's name, for the avatar fallback. */
  protected readonly initials = computed(() =>
    this.hero()
      .name.split(/\s+/)
      .filter((word) => /^[A-Za-z]/.test(word))
      .slice(0, 2)
      .map((word) => word.charAt(0).toUpperCase())
      .join(''),
  );
}
