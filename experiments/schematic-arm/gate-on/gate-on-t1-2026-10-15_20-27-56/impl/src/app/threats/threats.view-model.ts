import { computed, inject, Injectable } from '@angular/core';
import { CLEARANCE_TIERS, type ClearanceTier } from '../domain/hero.model';
import { HeroService } from '../domain/hero.service';

export type CoverageState = 'Covered' | 'Thin' | 'Uncovered';

/** Responders needed before a threat tier counts as covered rather than thin. */
const RESPONDERS_FOR_COVERED = 2;

/** One threat tier and the Active heroes whose clearance reaches it. */
export interface ThreatCoverage {
  readonly tier: ClearanceTier;
  readonly responders: readonly string[];
  readonly state: CoverageState;
  readonly icon: 'lucideCheck' | 'lucideShieldAlert' | 'lucideTriangleAlert';
  readonly variant: 'default' | 'outline' | 'destructive';
}

// Component-scoped: provided by Threats, so each visit reads the live roster.
@Injectable()
export class ThreatsViewModel {
  private readonly heroService = inject(HeroService);

  /**
   * A hero can answer a threat at or below their clearance, so a Tier 3 threat is covered by
   * Active heroes cleared to Tier 3 or higher. Injured, reserve, and MIA heroes do not respond.
   */
  readonly coverage = computed<readonly ThreatCoverage[]>(() => {
    const responders = this.heroService.heroes().filter((hero) => hero.status === 'Active');

    return CLEARANCE_TIERS.map((tier, index) => {
      const cleared = responders.filter((hero) => CLEARANCE_TIERS.indexOf(hero.clearance) >= index);
      const count = cleared.length;
      const state: CoverageState = count === 0 ? 'Uncovered' : count < RESPONDERS_FOR_COVERED ? 'Thin' : 'Covered';

      return {
        tier,
        responders: cleared.map((hero) => hero.name),
        state,
        icon: state === 'Covered' ? 'lucideCheck' : state === 'Thin' ? 'lucideShieldAlert' : 'lucideTriangleAlert',
        variant: state === 'Covered' ? 'default' : state === 'Thin' ? 'outline' : 'destructive',
      };
    });
  });

  readonly uncoveredCount = computed(() => this.coverage().filter((row) => row.state === 'Uncovered').length);

  readonly activeCount = computed(() => this.heroService.heroes().filter((hero) => hero.status === 'Active').length);
}
