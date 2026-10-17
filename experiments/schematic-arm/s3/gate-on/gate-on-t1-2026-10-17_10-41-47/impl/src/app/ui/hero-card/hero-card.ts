import { Component, computed, input, output } from '@angular/core';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadge } from '@spartan-ng/helm/badge';
import { HlmButton } from '@spartan-ng/helm/button';
import { HlmCard, HlmCardContent, HlmCardDescription, HlmCardFooter, HlmCardHeader, HlmCardTitle } from '@spartan-ng/helm/card';
import { heroInitials, STATUS_VARIANT } from '../../domain/hero-presentation';
import type { Hero } from '../../domain/hero.model';
import { PowerMeter } from '../power-meter/power-meter';

// Presentational: the hero comes in as an input, the dossier request goes out as an output.
// Navigation is the ViewModel's job, so this component injects nothing.
@Component({
  selector: 'app-hero-card',
  imports: [
    HlmAvatarImports,
    HlmBadge,
    HlmButton,
    HlmCard,
    HlmCardContent,
    HlmCardDescription,
    HlmCardFooter,
    HlmCardHeader,
    HlmCardTitle,
    PowerMeter,
  ],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly opened = output<Hero>();

  protected readonly statusVariant = computed(() => STATUS_VARIANT[this.hero().status]);

  protected readonly initials = computed(() => heroInitials(this.hero().name));
}
