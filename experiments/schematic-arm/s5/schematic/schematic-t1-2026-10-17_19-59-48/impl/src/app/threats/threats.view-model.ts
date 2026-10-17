import { Injectable, computed, inject } from '@angular/core';
import type { Hero, HeroClearance } from '../hero/hero.model';
import { HeroService } from '../hero/hero.service';
import { CLEARANCE_RESPONSE, CLEARANCE_TIERS, clearanceRank } from '../hero/hero-presentation';

/** Every piece of copy the threats screen shows. The template binds to these and never repeats them. */
const THREATS_TEXT = {
  title: 'Threat board',
  intro: 'Clearance tiers against the active roster, and the heroes currently out of action.',
  openIncidents: 'Open incidents',
  openIncidentsHint: 'Heroes Injured or MIA',
  responders: 'Tier 4 responders',
  respondersHint: 'Active, cleared Tier 4 or above',
  tiersTitle: 'Clearance tiers',
  incidentsTitle: 'Open incidents',
  cleared: 'cleared',
  noIncidents: 'No open incidents. Every hero is Active or in Reserve.',
} as const;

export interface TierRow {
  readonly tier: HeroClearance;
  readonly response: string;
  readonly cleared: number;
}

/**
 * Threats state: the clearance ladder with how many active heroes each tier covers, and the
 * incidents (heroes Injured or MIA). Derived from the shared roster, so it stays current.
 */
@Injectable()
export class ThreatsViewModel {
  private readonly roster = inject(HeroService).heroes;

  readonly text = THREATS_TEXT;

  readonly incidents = computed<readonly Hero[]>(() =>
    this.roster().filter((hero) => hero.status === 'Injured' || hero.status === 'MIA'),
  );
  readonly incidentCount = computed(() => this.incidents().length);
  readonly tier4Responders = computed(
    () =>
      this.roster().filter((hero) => hero.active && clearanceRank(hero.clearance) >= clearanceRank('Tier 4'))
        .length,
  );

  readonly tiers = computed<readonly TierRow[]>(() =>
    CLEARANCE_TIERS.map((tier) => ({
      tier,
      response: CLEARANCE_RESPONSE[tier],
      cleared: this.roster().filter((hero) => hero.active && clearanceRank(hero.clearance) >= clearanceRank(tier))
        .length,
    })),
  );
}
