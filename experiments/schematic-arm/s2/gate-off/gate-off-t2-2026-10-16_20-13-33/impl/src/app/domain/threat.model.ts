import { CLEARANCE_TIERS, type ClearanceTier, type Hero } from './hero.model';

/** A threat the agency responds to. Its tier is the clearance a hero needs to be deployed against it. */
export interface Threat {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  readonly tier: ClearanceTier;
}

/** A tier's position in the clearance ladder, 0 for Tier 1 up to 4 for Tier 5. */
export function tierRank(tier: ClearanceTier): number {
  return CLEARANCE_TIERS.indexOf(tier);
}

/** Whether a hero's clearance meets a threat's tier. A hero is only deployed against threats they are cleared for. */
export function isCleared(hero: Hero, threat: Threat): boolean {
  return tierRank(hero.clearance) >= tierRank(threat.tier);
}
