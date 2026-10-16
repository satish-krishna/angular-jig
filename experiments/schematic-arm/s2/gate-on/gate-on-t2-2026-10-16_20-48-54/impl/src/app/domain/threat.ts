import type { ClearanceTier } from './hero';

/** Where a threat stands on the watch list. */
export const THREAT_STATUSES = ['Monitoring', 'Engaged', 'Contained'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

export interface Threat {
  /** Watch-list id, e.g. THR-01. */
  readonly id: string;
  readonly name: string;
  /** Threat tier, 1 (lowest) to 5 (highest). Tier 4 and up need senior clearance to respond. */
  readonly tier: ClearanceTier;
  readonly region: string;
  readonly status: ThreatStatus;
}
