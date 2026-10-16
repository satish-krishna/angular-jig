import type { ClearanceTier } from './hero.model';

export const THREAT_STATUSES = ['Open', 'Contained'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

/** Threat tier shares the 1-to-5 scale of clearance: 5 is the most severe. */
export type ThreatTier = ClearanceTier;

/** A threat on the board. Titles and districts are example text. */
export interface Threat {
  readonly id: string;
  readonly title: string;
  readonly district: string;
  readonly tier: ThreatTier;
  readonly status: ThreatStatus;
}
