import { Injectable, computed, inject } from '@angular/core';
import { HeroService } from '../domain/hero.service';
import { CLEARANCE_TIERS, type ClearanceTier, type Hero } from '../domain/hero';

/** Example threat scale, one line per clearance tier. Illustrative only. */
const THREAT_SCALE: Readonly<Record<ClearanceTier, string>> = {
  'Tier 1': 'Routine response',
  'Tier 2': 'Local incident',
  'Tier 3': 'Regional threat',
  'Tier 4': 'Multi-city incident',
  'Tier 5': 'Cosmic-scale threat',
};

export interface ThreatTierRow {
  readonly tier: ClearanceTier;
  readonly scale: string;
  /** Heroes whose clearance meets this tier, so they may respond to it. */
  readonly cleared: number;
  /** Cleared heroes who are Active and can deploy now. */
  readonly ready: number;
}

// Owns the threats screen: which clearance tiers can respond to a threat, and who needs attention. Component-scoped, no DOM.
// Clearance gates a response, so the tier table is derived from the roster rather than kept as a second record.
@Injectable()
export class ThreatsViewModel {
  private readonly heroes = inject(HeroService).heroes;

  // Highest tier first, so the most restricted response leads the table.
  readonly tiers = computed<readonly ThreatTierRow[]>(() =>
    [...CLEARANCE_TIERS].reverse().map((tier) => {
      const cleared = this.heroes().filter((hero) => this.rank(hero.clearance) >= this.rank(tier));
      return {
        tier,
        scale: THREAT_SCALE[tier],
        cleared: cleared.length,
        ready: cleared.filter((hero) => hero.status === 'Active').length,
      };
    }),
  );

  // Injured and MIA heroes cannot respond, so they are listed for follow-up.
  readonly attention = computed<readonly Hero[]>(() =>
    this.heroes().filter((hero) => hero.status === 'Injured' || hero.status === 'MIA'),
  );

  private rank(tier: ClearanceTier): number {
    return CLEARANCE_TIERS.indexOf(tier);
  }
}
