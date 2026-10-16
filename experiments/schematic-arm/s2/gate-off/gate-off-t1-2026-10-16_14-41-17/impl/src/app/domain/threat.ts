import type { Hero } from './hero';

export const THREAT_STATUSES = ['Open', 'Contained', 'Closed'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

/** Threat tier, 1 (minor) to 5 (critical). */
export type ThreatTier = 1 | 2 | 3 | 4 | 5;

export interface Threat {
  readonly id: string;
  readonly title: string;
  readonly sector: string;
  readonly tier: ThreatTier;
  readonly status: ThreatStatus;
  readonly summary: string;
  /** Roster ids. A hero may be retired after assignment, so readers resolve these against the roster. */
  readonly assignedHeroIds: readonly string[];
}

/** A threat with its assigned heroes resolved against the live roster. */
export interface ThreatWithHeroes extends Threat {
  readonly heroes: readonly Hero[];
}
