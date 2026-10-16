import { Injectable, computed, inject } from '@angular/core';
import { EXAMPLE_THREATS } from '../domain/threat.example-threats';
import { HeroService } from '../domain/hero.service';

// Component-scoped (the Threats component provides it). Orders the threat list and
// counts how many heroes on the live roster are cleared for the highest tier.
@Injectable()
export class ThreatsViewModel {
  private readonly heroes = inject(HeroService);

  // Highest tier first, so the most dangerous threats lead the list.
  readonly threats = [...EXAMPLE_THREATS].sort((a, b) => b.tier - a.tier);

  readonly openCount = this.threats.filter((threat) => threat.status === 'Open').length;

  readonly peakTier = Math.max(...this.threats.map((threat) => threat.tier));

  // An Active hero cleared at or above the peak tier can take the most dangerous job.
  readonly clearedForPeak = computed(
    () =>
      this.heroes
        .roster()
        .filter((hero) => hero.status === 'Active' && hero.clearanceTier >= this.peakTier).length,
  );
}
