import type { ClearanceTier } from './hero';

// Active threat assessments the console tracks. Pure types, no DOM, no services.

export const THREAT_STATUSES = ['Open', 'Contained', 'Escalated'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

export interface Threat {
  readonly id: string;
  readonly name: string;
  readonly zone: string;
  /** Threat tier, 1 (routine) to 5 (cosmic). Tier sets the clearance a response needs. */
  readonly tier: ClearanceTier;
  readonly status: ThreatStatus;
}
