import type { PowerClass } from './hero.model';

/** How dangerous a threat is, 1 (minor) to 5 (critical). */
export type ThreatLevel = 1 | 2 | 3 | 4 | 5;

export const THREAT_STATUSES = ['Active', 'Monitoring', 'Contained'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

export interface Threat {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  readonly level: ThreatLevel;
  readonly powerClass: PowerClass;
  readonly status: ThreatStatus;
  readonly summary: string;
}
