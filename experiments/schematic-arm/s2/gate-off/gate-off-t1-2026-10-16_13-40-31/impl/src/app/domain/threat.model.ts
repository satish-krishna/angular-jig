export const THREAT_TIERS = [1, 2, 3, 4, 5] as const;
export type ThreatTier = (typeof THREAT_TIERS)[number];

export const THREAT_STATUSES = ['Open', 'Escalating', 'Contained'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

/** A hazard the agency is tracking. Threats are not tied to individual heroes. */
export interface Threat {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  readonly tier: ThreatTier;
  readonly status: ThreatStatus;
  readonly summary: string;
}
