import type { ClearanceTier } from './hero.model';

export const THREAT_STATUSES = ['Open', 'Contained', 'Monitoring'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

export interface Threat {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  /** Threat tier, on the same 1-5 scale as clearance: a tier-N threat needs a tier-N cleared hero. */
  readonly tier: ClearanceTier;
  readonly status: ThreatStatus;
  readonly summary: string;
}
