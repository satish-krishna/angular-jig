import type { ClearanceTier } from './hero.model';

export const THREAT_LEVELS = ['Low', 'Elevated', 'Severe', 'Critical'] as const;
export type ThreatLevel = (typeof THREAT_LEVELS)[number];

export const THREAT_STATUSES = ['Open', 'Monitoring', 'Contained'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

export interface Threat {
  readonly id: string;
  readonly codename: string;
  readonly location: string;
  readonly level: ThreatLevel;
  readonly status: ThreatStatus;
  /** The clearance an operative needs before they can be tasked against this threat. */
  readonly requiredClearance: ClearanceTier;
  readonly summary: string;
}
