import type { ClearanceTier } from './hero.model';

export const THREAT_STATUSES = ['Open', 'Contained'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

export interface Threat {
  /** Threat id, e.g. "THR-01". */
  readonly id: string;
  readonly name: string;
  readonly region: string;
  /** Threat tier on the same 1 to 5 scale as hero clearance. */
  readonly tier: ClearanceTier;
  readonly status: ThreatStatus;
}
