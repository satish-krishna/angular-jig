export const THREAT_STATUSES = ['Active', 'Contained', 'Monitoring'] as const;
export type ThreatStatus = (typeof THREAT_STATUSES)[number];

export interface Threat {
  readonly id: string;
  readonly name: string;
  readonly region: string;
  // 1 (low) to 5 (critical).
  readonly tier: number;
  readonly status: ThreatStatus;
}
