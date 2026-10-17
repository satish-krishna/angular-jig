export const THREAT_TIERS = ['Minor', 'Moderate', 'Serious', 'Severe', 'Catastrophic'] as const;
export type ThreatTier = (typeof THREAT_TIERS)[number];

export const INCIDENT_STATUSES = ['Open', 'Contained', 'Closed'] as const;
export type IncidentStatus = (typeof INCIDENT_STATUSES)[number];

export interface Incident {
  readonly id: string;
  readonly title: string;
  readonly tier: ThreatTier;
  readonly status: IncidentStatus;
  readonly location: string;
  /** ISO date the incident was logged. */
  readonly reportedOn: string;
  /** Hero id of the assigned responder, or null while unassigned. */
  readonly assignedHeroId: string | null;
}
