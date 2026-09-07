export type ThreatCategory = 'Kaiju' | 'Rogue' | 'Anomaly' | 'Syndicate' | 'Cosmic';
export type ThreatLevel = 'Low' | 'Moderate' | 'Severe' | 'Critical';
export type ThreatStatus = 'Active' | 'Contained' | 'Neutralized';

export interface Threat {
  readonly id: string;
  designation: string;
  category: ThreatCategory;
  level: ThreatLevel;
  status: ThreatStatus;
  location: string;
  /** ISO date, never a Date object: templates must not construct dates. */
  firstSeenOn: string;
  notes: string;
}
