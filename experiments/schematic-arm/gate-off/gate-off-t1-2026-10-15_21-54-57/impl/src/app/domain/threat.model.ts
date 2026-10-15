/** Threat tiers, 1 (lowest) to 5 (highest). Same scale as clearance, so the two read together. */
export const THREAT_TIERS = [1, 2, 3, 4, 5] as const;
export type ThreatTier = (typeof THREAT_TIERS)[number];

/** Threat status. Only `Open` threats count toward the dashboard's open-threat figure. */
export const THREAT_STATUSES = ['Open', 'Contained', 'Resolved'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

export interface Threat {
  readonly id: string;
  readonly name: string;
  readonly tier: ThreatTier;
  readonly status: ThreatStatus;
  readonly location: string;
  readonly summary: string;
}
