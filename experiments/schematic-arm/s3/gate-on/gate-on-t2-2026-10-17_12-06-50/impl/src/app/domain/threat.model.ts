export const THREAT_LEVELS = ['Low', 'Moderate', 'High', 'Severe', 'Critical'] as const;
export type ThreatLevel = (typeof THREAT_LEVELS)[number];

export interface Threat {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  readonly level: ThreatLevel;
  readonly summary: string;
}
