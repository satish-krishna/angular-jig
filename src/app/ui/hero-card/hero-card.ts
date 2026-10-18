import { Component, input, output } from '@angular/core';
import type { Hero } from '../../hero/hero.model';
import { HlmAvatarImports } from '@spartan-ng/helm/avatar';
import { HlmBadgeImports } from '@spartan-ng/helm/badge';
import { HlmButtonImports } from '@spartan-ng/helm/button';
import { HlmCardImports } from '@spartan-ng/helm/card';
import { HlmMuted } from '@spartan-ng/helm/typography';

@Component({
  selector: 'app-hero-card',
  imports: [HlmAvatarImports, HlmBadgeImports, HlmButtonImports, HlmCardImports, HlmMuted],
  templateUrl: './hero-card.html',
  styleUrl: './hero-card.css',
})
export class HeroCard {
  readonly hero = input.required<Hero>();
  readonly select = output<Hero>();

  statusVariant(status: string): 'default' | 'secondary' | 'destructive' {
    return status === 'Active' ? 'default' : status === 'Injured' ? 'destructive' : 'secondary';
  }
}
