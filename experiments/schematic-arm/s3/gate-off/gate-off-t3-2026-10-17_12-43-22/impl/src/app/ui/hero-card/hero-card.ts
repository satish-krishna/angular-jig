import { Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import type { BadgeVariants } from '@spartan-ng/helm/badge';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmTypographyImports } from '@spartan-ng/helm/typography';
import type { Hero, HeroStatus } from '../../domain/hero.model';
import { PowerMeter } from '../power-meter/power-meter';

type BadgeVariant = NonNullable<BadgeVariants['variant']>;

// Status carries meaning, so each one maps to a semantic badge variant.
export const STATUS_VARIANT: Readonly<Record<HeroStatus, BadgeVariant>> = {
  Active: 'success',
  Injured: 'warning',
  Reserve: 'secondary',
  MIA: 'destructive',
};

// Two-letter portrait fallback, shared by every screen that draws a hero avatar.
export function heroInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase();
}

// Presentational: one hero as a card. The whole card opens the detail screen
// through a stretched link on the name, so there is one tab stop per card.
@Component({
  selector: 'app-hero-card',
  imports: [RouterLink, HlmAvatarImports, HlmBadgeImports, HlmCardImports, HlmTypographyImports, PowerMeter],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  public readonly hero = input.required<Hero>();

  protected readonly initials = computed(() => heroInitials(this.hero().name));

  protected readonly statusVariant = computed(() => STATUS_VARIANT[this.hero().status]);

  protected readonly detailLink = computed(() => ['/detail', this.hero().id]);
}
