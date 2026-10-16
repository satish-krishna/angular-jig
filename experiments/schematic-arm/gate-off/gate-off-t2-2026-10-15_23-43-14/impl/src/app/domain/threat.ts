/** Threat severity, lowest to highest. The order is the sort order, so keep it ascending. */
export const THREAT_LEVELS = ['Low', 'Moderate', 'High', 'Critical'] as const;
export type ThreatLevel = (typeof THREAT_LEVELS)[number];

export const THREAT_STATUSES = ['Open', 'Monitoring', 'Contained'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

export interface Threat {
  readonly id: string;
  readonly title: string;
  readonly region: string;
  readonly level: ThreatLevel;
  readonly status: ThreatStatus;
  readonly summary: string;
}
