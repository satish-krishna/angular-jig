export type ThreatTier = 1 | 2 | 3 | 4 | 5;
export type ThreatStatus = 'Open' | 'Engaged' | 'Contained';

export interface Threat {
  readonly id: string;
  readonly name: string;
  readonly tier: ThreatTier;
  readonly location: string;
  readonly status: ThreatStatus;
}
